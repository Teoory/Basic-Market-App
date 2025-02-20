import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const Calculator = () => {
    const [values, setValues] = useState([]);
    const [currentValue, setCurrentValue] = useState('');
    const [profitRate, setProfitRate] = useState(25);
    const [taxRate, setTaxRate] = useState(15);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { user } = useAuth();
    const [rateInterval, setRateInterval] = useState(null);
    const [rateSpeed, setRateSpeed] = useState(100); // Başlangıç hızı (ms)

    const handleAddValue = () => {
        if (currentValue) {
            setValues([...values, parseFloat(currentValue)]);
            setCurrentValue('');
        }
    };

    const handleRemoveLastValue = () => {
        setValues(values.slice(0, -1));
    };

    const calculateTotal = () => {
        return values.reduce((sum, value) => sum + value, 0);
    };

    const calculateProfitPrice = () => {
        const total = calculateTotal();
        return total + (total * (profitRate / 100));
    };

    const calculateTax = () => {
        const profitPrice = calculateProfitPrice();
        return profitPrice * (taxRate / 100);
    };

    const calculateFinalPrice = () => {
        return calculateProfitPrice() + calculateTax();
    };

    const handleSave = async () => {
        if (!user?.isAdmin) return;

        try {
            const response = await fetch(API_ENDPOINTS.SALES, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify({
                    name,
                    description,
                    values,
                    profitRate,
                    taxRate,
                    totalCost: calculateTotal(),
                    profitPrice: calculateProfitPrice(),
                    tax: calculateTax(),
                    finalPrice: calculateFinalPrice()
                })
            });

            if (response.ok) {
                setValues([]);
                setCurrentValue('');
                setName('');
                setDescription('');
                alert('Hesaplama başarıyla kaydedildi!');
            }
        } catch (err) {
            console.error('Hesaplama kaydedilirken hata:', err);
        }
    };

    // Rate değiştirme fonksiyonları
    const handleRateChange = (setter, increment, currentValue) => {
        const newValue = currentValue + increment;
        if (newValue >= 0) {
            setter(newValue);
            
            // Hızlanma için interval'i temizle ve yeni hızla başlat
            clearInterval(rateInterval);
            setRateInterval(setInterval(() => {
                setter(prev => {
                    const nextValue = prev + increment;
                    return nextValue >= 0 ? nextValue : prev;
                });
                setRateSpeed(prev => Math.max(50, prev * 0.8));
            }, rateSpeed));
        }
    };

    // Tek seferlik değişiklik için yeni fonksiyon
    const handleSingleRateChange = (setter, increment, currentValue) => {
        const newValue = currentValue + increment;
        if (newValue >= 0) {
            setter(newValue);
        }
    };

    // Mouse/touch bırakıldığında
    const handleRateStop = () => {
        clearInterval(rateInterval);
        setRateSpeed(100); // Hızı sıfırla
    };

    // Component unmount olduğunda interval'i temizle
    useEffect(() => {
        return () => clearInterval(rateInterval);
    }, [rateInterval]);

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <div className="calculator-section">
                        <h1 className="calculator-title">Kar ve Vergi Hesaplama</h1>
                        
                        <div className="calculator-form">
                            <div className="input-section">
                                <input
                                    type="number"
                                    value={currentValue}
                                    onChange={(e) => setCurrentValue(e.target.value)}
                                    placeholder="Miktarı girin..."
                                    className="value-input"
                                />
                                <div className="button-group">
                                    <button 
                                        onClick={handleAddValue}
                                        className="action-button add-button"
                                    >
                                        Yeni Değer Ekle
                                    </button>
                                    <button 
                                        onClick={handleRemoveLastValue}
                                        className="action-button remove-button"
                                    >
                                        Son Değeri Sil
                                    </button>
                                </div>
                            </div>

                            {values.length > 0 && (
                                <div className="values-list">
                                    {values.map((value, index) => (
                                        <span key={index} className="value-chip">
                                            {value}₺
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="rates-section">
                                <div className="rate-input">
                                    <label className="rate-label">
                                        Kar oranı:
                                        <div className="rate-input-group">
                                            <input
                                                type="number"
                                                value={profitRate}
                                                className="rate-input-field"
                                                readOnly
                                            />
                                            <div className="rate-controls">
                                                <div className="increase-button">
                                                    <button
                                                        onMouseDown={() => handleRateChange(setProfitRate, 1, profitRate)}
                                                        onMouseUp={handleRateStop}
                                                        onMouseLeave={handleRateStop}
                                                        onTouchStart={() => handleRateChange(setProfitRate, 1, profitRate)}
                                                        onTouchEnd={handleRateStop}
                                                    >
                                                        +1
                                                    </button>
                                                    <button onClick={() => handleSingleRateChange(setProfitRate, 5, profitRate)}>
                                                        +5
                                                    </button>
                                                    <button onClick={() => handleSingleRateChange(setProfitRate, 10, profitRate)}>
                                                        +10
                                                    </button>
                                                    <button onClick={() => handleSingleRateChange(setProfitRate, 50, profitRate)}>
                                                        +50
                                                    </button>
                                                </div>
                                                <div className="decrease-button">
                                                    <button
                                                        onMouseDown={() => handleRateChange(setProfitRate, -1, profitRate)}
                                                        onMouseUp={handleRateStop}
                                                        onMouseLeave={handleRateStop}
                                                        onTouchStart={() => handleRateChange(setProfitRate, -1, profitRate)}
                                                        onTouchEnd={handleRateStop}
                                                        disabled={profitRate <= 0}
                                                    >
                                                        -1
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSingleRateChange(setProfitRate, -5, profitRate)}
                                                        disabled={profitRate < 5}
                                                    >
                                                        -5
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSingleRateChange(setProfitRate, -10, profitRate)}
                                                        disabled={profitRate < 10}
                                                    >
                                                        -10
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSingleRateChange(setProfitRate, -50, profitRate)}
                                                        disabled={profitRate < 50}
                                                    >
                                                        -50
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="rate-input">
                                    <label className="rate-label">
                                        Vergi oranı:
                                        <div className="rate-input-group">
                                            <input
                                                type="number"
                                                value={taxRate}
                                                className="rate-input-field"
                                                readOnly
                                            />
                                            <div className="rate-controls">
                                                <div className="increase-button">
                                                    <button
                                                        onMouseDown={() => handleRateChange(setTaxRate, 1, taxRate)}
                                                        onMouseUp={handleRateStop}
                                                        onMouseLeave={handleRateStop}
                                                        onTouchStart={() => handleRateChange(setTaxRate, 1, taxRate)}
                                                        onTouchEnd={handleRateStop}
                                                    >
                                                        +1
                                                    </button>
                                                    <button onClick={() => handleSingleRateChange(setTaxRate, 5, taxRate)}>
                                                        +5
                                                    </button>
                                                    <button onClick={() => handleSingleRateChange(setTaxRate, 10, taxRate)}>
                                                        +10
                                                    </button>
                                                    <button onClick={() => handleSingleRateChange(setTaxRate, 50, taxRate)}>
                                                        +50
                                                    </button>
                                                </div>

                                                <div className="decrease-button">
                                                    <button
                                                        onMouseDown={() => handleRateChange(setTaxRate, -1, taxRate)}
                                                        onMouseUp={handleRateStop}
                                                        onMouseLeave={handleRateStop}
                                                        onTouchStart={() => handleRateChange(setTaxRate, -1, taxRate)}
                                                        onTouchEnd={handleRateStop}
                                                        disabled={taxRate <= 0}
                                                    >
                                                        -1
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSingleRateChange(setTaxRate, -5, taxRate)}
                                                        disabled={taxRate < 5}
                                                    >
                                                        -5
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSingleRateChange(setTaxRate, -10, taxRate)}
                                                        disabled={taxRate < 10}
                                                    >
                                                        -10
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSingleRateChange(setTaxRate, -50, taxRate)}
                                                        disabled={taxRate < 50}
                                                    >
                                                        -50
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="results-grid">
                                <div className="result-item">
                                    <span className="result-label">Kar ve Vergisiz Toplam:</span>
                                    <span className="result-value">{calculateTotal().toFixed(2)}₺</span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">Kar ({profitRate}% eklenecek kar):</span>
                                    <span className="result-value">{(calculateProfitPrice() - calculateTotal()).toFixed(2)}₺</span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">Toplam:</span>
                                    <span className="result-value">{calculateProfitPrice().toFixed(2)}₺</span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">Vergi (Karlı fiyata {taxRate}% eklenecek):</span>
                                    <span className="result-value">{calculateTax().toFixed(2)}₺</span>
                                </div>
                                <div className="result-item total">
                                    <span className="result-label">Toplam Fiyat (Karlı Fiyat + Vergi):</span>
                                    <span className="result-value">{calculateFinalPrice().toFixed(2)}₺</span>
                                </div>
                            </div>

                            {user?.isAdmin && (
                                <div className="save-section">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="İsim"
                                        className="save-input"
                                    />
                                    <div className="textarea-container">
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Açıklama (Zorunlu değil)"
                                            className="save-input"
                                            maxLength={255}
                                        />
                                        <div className="char-count">
                                            {description.length}/255
                                        </div>
                                    </div>
                                    <button onClick={handleSave} className="save-button">
                                        Kaydet
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Calculator; 