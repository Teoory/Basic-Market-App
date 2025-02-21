import React from 'react';
import Navbar from '../components/Navbar';

const UsageAndPurpose = () => {
    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <div className="usage-purpose-content">
                        <h1>Kullanım ve Amaç</h1>
                        
                        <section className="info-section">
                            <h2>Önemli Bilgilendirme</h2>
                            <div className="warning-box">
                                <p>Bu site tamamen sanal bir oyun deneyimi için tasarlanmıştır. Sitede yer alan hiçbir içerik gerçek değildir ve tamamı hayal ürünüdür.</p>
                            </div>
                        </section>

                        <section className="info-section">
                            <h2>FiveM Nedir?</h2>
                            <p>
                                FiveM, Grand Theft Auto V oyunu için geliştirilmiş bir multiplayer modifikasyonudur. 
                                Özel sunucularda oyuncuların bir araya gelerek çeşitli rol yapma senaryoları oluşturmasına olanak sağlar.
                                Daha detaylı bilgi için <a href="https://fivem.net/" target="_blank" rel="noopener noreferrer">FiveM'in resmi sitesini</a> ziyaret edebilirsiniz.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Site Hakkında</h2>
                            <p>
                                Bu web sitesi, FiveM platformunda kullanılan <a href="https://github.com/qbcore-framework" target="_blank" rel="noopener noreferrer">QB-Core</a> modunun 
                                yönetimi için özel olarak geliştirilmiştir. Sitede kullanılan görseller ve içerikler QB-Core moduna aittir.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Yasal Uyarı</h2>
                            <div className="legal-warning">
                                <p>
                                    Bu site yalnızca oyun içi kullanım için tasarlanmıştır. Herhangi bir yasadışı kullanım durumunda:
                                </p>
                                <ul>
                                    <li>Kullanıcı bilgileri ilgili resmi kurumlarla paylaşılacaktır</li>
                                    <li>İlgili hesaplar kalıcı olarak yasaklanacaktır</li>
                                    <li>Gerekli yasal işlemler başlatılacaktır</li>
                                </ul>
                            </div>
                        </section>

                        <section className="info-section">
                            <h2>Sorumluluk Reddi</h2>
                            <p>
                                Sitedeki hiçbir içerik gerçek para, ürün veya hizmet ile ilişkili değildir. 
                                Tüm işlemler ve içerikler sadece FiveM oyun modu kapsamında geçerlidir.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UsageAndPurpose; 