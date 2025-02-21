const express = require ('express');
const session = require ('express-session');
const cors = require ('cors');
const mongoose = require ('mongoose');

const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
const cookieParser = require ('cookie-parser');

const User = require ('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { sendDiscordNotification } = require('./utils/discord');
const Sale = require('./models/Sale');
const Note = require('./models/Note');
const BackDoorAccount = require('./models/BackDoorAccount');
const Setting = require('./models/Setting');

const app = express ();
require ('dotenv').config ();

const salt = bcrypt.genSaltSync (10);
const corsOptions = {
    origin : ['http://localhost:5173', 'http://localhost:3030'],
    credentials : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use (cors (corsOptions));
app.use (express.json ());
app.use (cookieParser ());
app.use (session({
    secret: process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : { secure : false },
}));

mongoose.connect (process.env.MONGODB_URL);
const bucket = process.env.BUCKET_NAME;
const secret = process.env.SECRET;

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
            role: 'user',
        });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        const userDoc = await User.findOne({username});
        if (!userDoc) {
            return res.status(400).json({message: 'Kullanıcı bulunamadı'});
        }
        
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            const token = jwt.sign(
                {
                    id: userDoc._id,
                    username: userDoc.username,
                    role: userDoc.role,
                    isAdmin: userDoc.role === 'admin'
                },
                secret
            );

            res.cookie('token', token, {
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: false,
                secure: true
            }).json({
                id: userDoc._id,
                username: userDoc.username,
                role: userDoc.role,
                isAdmin: userDoc.role === 'admin'
            });
        } else {
            res.status(400).json({message: 'Şifre yanlış'});
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('token');
    res.cookie('token', '', {
        sameSite: "none",
        maxAge: 0,
        httpOnly: false,
        secure: true
    });
    res.status(200).send('Logged out successfully');
});

app.get('/profile', async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'No token found' });
        }

        const decoded = jwt.verify(token, secret);
        const userDoc = await User.findById(decoded.id)
            .select('-password');
            
        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: userDoc._id,
            username: userDoc.username,
            role: userDoc.role
        });
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Auth middleware
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Geçersiz token' });
    }
};

// Admin middleware
const isAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Geçersiz token' });
    }
};

// Önce spesifik endpoint'ler
app.get('/products/popular', async (req, res) => {
    try {
        const products = await Product.find({ viewCount: { $gt: 0 } })
            .sort({ viewCount: -1 })
            .limit(5);
            
        if (products.length === 0) {
            return res.json([]);
        }
        
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Sonra arama endpoint'i
app.get('/products/search', async (req, res) => {
    try {
        const { q, full } = req.query;
        if (!q) return res.json([]);

        const query = {
            name: { $regex: q, $options: 'i' },
            isHidden: { $ne: true },
            stock: { $gt: 0 }
        };

        // full parametresi varsa tüm sonuçları, yoksa sadece ilk 5 sonucu döndür
        const products = await Product.find(query)
            .limit(full ? 0 : 5);

        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// En son genel ürün endpoint'i
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (e) {
        res.status(500).json(e);
    }
});

app.get('/products', async (req, res) => {
    try {
        const { showAll } = req.query;
        let query = {};
        if (!showAll) {
            query = {
                isHidden: { $ne: true },
                stock: { $gt: 0 }
            };
        }
        const products = await Product.find(query);
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ürün ekleme endpoint'ini güncelle
app.post('/products', isAdmin, async (req, res) => {
    try {
        const { name, price, stock, description, imageUrl, discountPercentage, type, images } = req.body;
        
        if (!imageUrl && images && images.length > 0) {
            // Eğer imageUrl boşsa ve images varsa, ilk resmi imageUrl olarak kullan
            imageUrl = images[0].url;
        }

        const productData = {
            name,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 0,
            description,
            imageUrl,
            type: type || 'normal',
            discountPercentage: parseFloat(discountPercentage) || 0,
            viewCount: 0
        };

        if (type === 'car' && images && images.length > 0) {
            productData.images = images;
        }

        if (discountPercentage > 0) {
            productData.originalPrice = productData.price;
            productData.price = productData.price - (productData.price * productData.discountPercentage / 100);
        }

        const product = await Product.create(productData);
        res.json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Ürün güncelleme (sadece admin)
app.put('/products/:id', isAdmin, async (req, res) => {
    try {
        const { price, discountPercentage } = req.body;
        const updateData = { ...req.body };
        
        if (discountPercentage > 0) {
            updateData.originalPrice = price;
            updateData.price = price - (price * discountPercentage / 100);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(product);
    } catch (e) {
        res.status(400).json(e);
    }
});

// Ürün görüntüleme sayısını artır
app.post('/products/:id/view', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        );
        res.json(product);
    } catch (e) {
        res.status(500).json(e);
    }
});

// Ürün görünürlüğünü değiştir
app.patch('/products/:id/toggle-visibility', isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        product.isHidden = !product.isHidden;
        await product.save();
        res.json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Ürün sipariş butonunu gizle/göster
app.patch('/products/:id/toggle-order-button', isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        product.isOrderButtonHidden = !product.isOrderButtonHidden;
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Sipariş oluşturma
app.post('/orders', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        
        // Ürün bilgilerini al
        const product = await Product.findById(order.productId);
        
        // Discord bildirimi gönder
        await sendDiscordNotification(order, product);
        
        res.json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Siparişleri getirme (admin için)
app.get('/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('productId')
            .sort('-createdAt');
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Okunmamış sipariş sayısını getirme
app.get('/orders/unread-count', isAdmin, async (req, res) => {
    try {
        const count = await Order.countDocuments({ isRead: false });
        res.json({ count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Siparişi okundu olarak işaretleme
app.patch('/orders/:id/mark-as-read', isAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Satış kaydetme endpoint'i
app.post('/sales', isAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            values,
            profitRate,
            taxRate,
            totalCost,
            profitPrice,
            tax,
            finalPrice
        } = req.body;

        const sale = await Sale.create({
            name,
            description,
            values,
            profitRate,
            taxRate,
            totalCost,
            profitPrice,
            tax,
            finalPrice
        });

        res.json(sale);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Satışları getirme endpoint'i
app.get('/sales', isAdmin, async (req, res) => {
    try {
        const sales = await Sale.find().sort('-createdAt');
        res.json(sales);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Not ekleme
app.post('/notes', authenticateToken, async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const note = await Note.create({
            title,
            content,
            status,
            userId: req.user.id
        });
        res.json(note);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Notları getirme
app.get('/notes', authenticateToken, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.id })
            .sort('-createdAt');
        res.json(notes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Not durumunu güncelleme
app.patch('/notes/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status },
            { new: true }
        );
        res.json(note);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Not silme
app.delete('/notes/:id', isAdmin, async (req, res) => {
    try {
        await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        res.json({ message: 'Not başarıyla silindi' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Sipariş silme endpoint'i
app.delete('/orders/:id', isAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sipariş başarıyla silindi' });
    } catch (err) {
        res.status(500).json({ error: 'Sipariş silinirken bir hata oluştu' });
    }
});

// Rastgele şifre oluşturma fonksiyonu
const generateRandomPassword = () => {
    return Math.random().toString().slice(2, 8);
};

// BackDoor hesabı oluşturma
app.post('/backdoor', isAdmin, async (req, res) => {
    try {
        const { username, note } = req.body;
        const password = generateRandomPassword();
        
        const account = await BackDoorAccount.create({
            username,
            password: await bcrypt.hash(password, 10),
            note
        });

        // Şifreyi şifrelenmemiş haliyle gönder
        res.json({ 
            message: 'BackDoor hesabı oluşturuldu',
            account: {
                username: account.username,
                password: password,
                note: account.note
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// BackDoor hesaplarını listele
app.get('/backdoor/accounts', isAdmin, async (req, res) => {
    try {
        const accounts = await BackDoorAccount.find({});
        res.json(accounts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// BackDoor hesap durumunu değiştir
app.patch('/backdoor/:id/toggle-status', isAdmin, async (req, res) => {
    try {
        const account = await BackDoorAccount.findById(req.params.id);
        account.isActive = !account.isActive;
        await account.save();
        res.json(account);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// BackDoor hesabını sil
app.delete('/backdoor/:id', isAdmin, async (req, res) => {
    try {
        await BackDoorAccount.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hesap silindi' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// BackDoor şifre sıfırlama
app.post('/backdoor/:id/reset-password', isAdmin, async (req, res) => {
    try {
        const newPassword = generateRandomPassword();
        const account = await BackDoorAccount.findById(req.params.id);
        account.password = await bcrypt.hash(newPassword, 10);
        await account.save();
        res.json({ newPassword });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// BackDoor giriş kontrolü
app.post('/backdoor/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const account = await BackDoorAccount.findOne({ username });
        
        if (!account || !account.isActive) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const isValid = await bcrypt.compare(password, account.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        // Giriş kaydı
        account.lastLogin = new Date();
        account.loginHistory.push({
            loginDate: new Date()
        });
        await account.save();

        res.json({ message: 'Giriş başarılı' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Global sipariş butonu durumunu değiştir
app.patch('/settings/toggle-order-button', isAdmin, async (req, res) => {
    try {
        let setting = await Setting.findOne({});
        if (!setting) {
            setting = new Setting();
        }
        setting.isOrderButtonGloballyHidden = !setting.isOrderButtonGloballyHidden;
        await setting.save();
        res.json(setting);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Global ayarları getir
app.get('/settings', async (req, res) => {
    try {
        let setting = await Setting.findOne({});
        if (!setting) {
            setting = new Setting();
            await setting.save();
        }
        res.json(setting);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen (process.env.PORT || 3030, () => {
    console.log ('Server is running on port 3030');
});