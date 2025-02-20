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
                    role: userDoc.role
                },
                secret
            );

            res.cookie('token', token, {
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000, // 24 saat
                httpOnly: false,
                secure: true
            }).json({
                id: userDoc._id,
                username: userDoc.username,
                role: userDoc.role
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

// Admin middleware'ini güncelle
const isAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin rights required' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
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
        const { name, price, originalPrice, stock, description, imageUrl, discountPercentage } = req.body;
        
        const productData = {
            name,
            price: parseFloat(price),
            originalPrice: parseFloat(originalPrice),
            stock: parseInt(stock),
            description,
            imageUrl,
            discountPercentage: parseFloat(discountPercentage || 0),
            viewCount: 0
        };

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

app.listen (process.env.PORT || 3030, () => {
    console.log ('Server is running on port 3030');
});