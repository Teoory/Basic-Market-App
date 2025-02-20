import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS = {
    bekleniyor: '#FCD34D',    // Sarı
    devam_ediyor: '#60A5FA',  // Mavi
    tamamlandi: '#34D399'     // Yeşil
};

const STATUS_LABELS = {
    bekleniyor: 'Bekliyor',
    devam_ediyor: 'Devam Ediyor',
    tamamlandi: 'Tamamlandı'
};

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('bekleniyor');
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const MAX_CHARS = 900;
    const [sortOrder, setSortOrder] = useState('newest');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (user) {
            fetchNotes();
        }
    }, [user]);

    const fetchNotes = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.NOTES, {
                ...API_CONFIG.FETCH_CONFIG
            });
            
            if (!response.ok) {
                throw new Error('Notlar yüklenirken bir hata oluştu');
            }
            
            const data = await response.json();
            setNotes(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Notlar yüklenirken hata:', err);
            setError(err.message);
            setNotes([]);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        try {
            const response = await fetch(API_ENDPOINTS.NOTES, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify({ 
                    title, 
                    content, 
                    status: 'bekleniyor'
                })
            });

            if (response.ok) {
                const addedNote = await response.json();
                setNotes([addedNote, ...notes]);
                setTitle('');
                setContent('');
            }
        } catch (err) {
            console.error('Not eklenirken hata:', err);
        }
    };

    const handleStatusChange = async (noteId, newStatus) => {
        try {
            const response = await fetch(API_ENDPOINTS.NOTE_STATUS(noteId), {
                method: 'PATCH',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const updatedNote = await response.json();
                setNotes(notes.map(note => 
                    note._id === noteId ? updatedNote : note
                ));
            }
        } catch (err) {
            console.error('Not durumu güncellenirken hata:', err);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            const response = await fetch(API_ENDPOINTS.NOTE_DELETE(noteId), {
                method: 'DELETE',
                ...API_CONFIG.FETCH_CONFIG
            });

            if (response.ok) {
                setNotes(notes.filter(note => note._id !== noteId));
            }
        } catch (err) {
            console.error('Not silinirken hata:', err);
        }
    };

    const getFilteredAndSortedNotes = () => {
        let filteredNotes = [...notes];
        
        if (statusFilter !== 'all') {
            filteredNotes = filteredNotes.filter(note => note.status === statusFilter);
        }

        filteredNotes.sort((a, b) => {
            if (sortOrder === 'newest' || sortOrder === 'oldest') {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            }

            const statusOrder = {
                'bekleniyor': 1,
                'devam_ediyor': 2,
                'tamamlandi': 3
            };

            if (sortOrder === 'pending_first') {
                return statusOrder[a.status] - statusOrder[b.status];
            }

            if (sortOrder === 'completed_first') {
                return statusOrder[b.status] - statusOrder[a.status];
            }

            return 0;
        });

        return filteredNotes;
    };

    if (!user) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <main className="main-content">
                    <div className="container">
                        <h1>Giriş Yapın</h1>
                        <p>Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <div className="notes-section">
                        <div className="notes-header">
                            <h1>Notlarım</h1>
                            <div className="notes-filters">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Tümü</option>
                                    <option value="bekleniyor">Bekleyenler</option>
                                    <option value="devam_ediyor">Devam Edenler</option>
                                    <option value="tamamlandi">Tamamlananlar</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="newest">Yeni → Eski</option>
                                    <option value="oldest">Eski → Yeni</option>
                                    <option value="pending_first">Bekleniyor → Tamamlandı</option>
                                    <option value="completed_first">Tamamlandı → Bekleniyor</option>
                                </select>
                            </div>
                        </div>
                        
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleAddNote} className="note-form">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Başlık"
                                className="note-input"
                                maxLength={100}
                            />
                            <div className="textarea-container">
                                <textarea
                                    value={content}
                                    onChange={(e) => {
                                        if (e.target.value.length <= MAX_CHARS) {
                                            setContent(e.target.value);
                                        }
                                    }}
                                    placeholder="Not içeriği..."
                                    rows="8"
                                    maxLength={MAX_CHARS}
                                />
                                <div className="char-counter">
                                    {content.length}/{MAX_CHARS}
                                </div>
                            </div>
                            <div className="note-form-footer">
                                <button type="submit" className="add-note-button">
                                    Not Ekle
                                </button>
                            </div>
                        </form>

                        <div className="notes-list">
                            {getFilteredAndSortedNotes().map(note => (
                                <div 
                                    key={note._id} 
                                    className="note-card"
                                    data-status={note.status}
                                >
                                    <div className="note-header">
                                        <h3>{note.title}</h3>
                                        <select
                                            value={note.status}
                                            onChange={(e) => handleStatusChange(note._id, e.target.value)}
                                            className="status-select"
                                            style={{
                                                backgroundColor: STATUS_COLORS[note.status],
                                                color: '#1F2937',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <option value="bekleniyor">Bekliyor</option>
                                            <option value="devam_ediyor">Devam Ediyor</option>
                                            <option value="tamamlandi">Tamamlandı</option>
                                        </select>
                                    </div>
                                    <p className="note-content">{note.content}</p>
                                    <div className="note-footer">
                                        <span className="note-date">
                                            {new Date(note.createdAt).toLocaleString('tr-TR')}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteNote(note._id)}
                                            className="delete-note-button"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Notes; 