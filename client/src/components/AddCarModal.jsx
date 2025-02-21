import { useState } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AddCarModal = ({ onClose, onAdd }) => {
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        stock: '',
        description: '',
        imageUrl: '',
        images: [],
        discountPercentage: '0',
        type: 'car'
    });
    const [error, setError] = useState('');
    const [imageUrls, setImageUrls] = useState(['']);

    const handleImageUrlChange = (index, value) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);

        if (index === 0) {
            setProductData(prev => ({...prev, imageUrl: value}));
        }

        const images = newUrls.filter(url => url).map((url, i) => ({
            url,
            order: i
        }));
        setProductData(prev => ({...prev, images}));
    };

    const addImageField = () => {
        setImageUrls([...imageUrls, '']);
    };

    const removeImageField = (index) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(newUrls);

        const images = newUrls.filter(url => url).map((url, i) => ({
            url,
            order: i
        }));
        setProductData({...productData, images});
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(imageUrls);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setImageUrls(items);
        
        const images = items.filter(url => url).map((url, i) => ({
            url,
            order: i
        }));
        setProductData({...productData, images});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!imageUrls[0]) {
            setError('En az bir resim eklemelisiniz');
            return;
        }

        try {
            const dataToSend = {
                ...productData,
                imageUrl: imageUrls[0],
                images: imageUrls.map((url, index) => ({
                    url,
                    order: index
                })),
                type: 'car'
            };

            const response = await fetch(API_ENDPOINTS.PRODUCTS, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                const newProduct = await response.json();
                onAdd(newProduct);
                onClose();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Bir hata oluştu');
            }
        } catch (err) {
            console.error('Araba eklenirken hata:', err);
            setError('Araba eklenirken bir hata oluştu');
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Yeni Araba Ekle</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Araba Adı</label>
                        <input
                            type="text"
                            value={productData.name}
                            onChange={(e) => setProductData({...productData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Fiyat (₺)</label>
                        <input
                            type="number"
                            value={productData.price}
                            onChange={(e) => setProductData({...productData, price: e.target.value})}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Stok Adedi</label>
                        <input
                            type="number"
                            value={productData.stock}
                            onChange={(e) => setProductData({...productData, stock: e.target.value})}
                            placeholder="0"
                            min="0"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>İndirim Yüzdesi (%)</label>
                        <input
                            type="number"
                            value={productData.discountPercentage}
                            onChange={(e) => setProductData({...productData, discountPercentage: e.target.value})}
                            placeholder="0"
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="form-group">
                        <label>Açıklama</label>
                        <textarea
                            value={productData.description}
                            onChange={(e) => setProductData({...productData, description: e.target.value})}
                            placeholder="Araba açıklamasını girin"
                            maxLength={255}
                            required
                        />
                        <div className="char-count">
                            {productData.description.length}/255
                        </div>
                    </div>

                    {/* Resim alanları */}
                    <div className="form-group">
                        <label>Resimler</label>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="images">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                        {imageUrls.map((url, index) => (
                                            <Draggable key={index} draggableId={`image-${index}`} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="image-field"
                                                    >
                                                        <input
                                                            type="url"
                                                            value={url}
                                                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                                            placeholder="Resim URL'si"
                                                            required={index === 0}
                                                        />
                                                        {url && (
                                                            <div className="image-preview">
                                                                <img 
                                                                    src={url} 
                                                                    alt={`Önizleme ${index + 1}`}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/100?text=Resim+Yüklenemedi';
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImageField(index)}
                                                                className="remove-image"
                                                            >
                                                                Sil
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <button type="button" onClick={addImageField} className="add-image">
                            Resim Ekle
                        </button>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-button">
                            İptal
                        </button>
                        <button type="submit" className="submit-button">
                            Araba Ekle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCarModal; 