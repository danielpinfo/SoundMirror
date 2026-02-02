import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getClients, 
  createClient, 
  updateClient, 
  deleteClient, 
  getClientStatistics,
  getClientNotes,
  createNote,
  deleteNote,
} from '../lib/db';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Home, 
  UserPlus,
  Users,
  User,
  Trash2,
  Edit,
  Save,
  X,
  FileText,
  Plus,
  ChevronRight,
  Activity,
  Target,
  Calendar,
  BarChart3,
  MessageSquare,
  Stethoscope,
} from 'lucide-react';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientStats, setClientStats] = useState(null);
  const [clientNotes, setClientNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('observation');
  
  // New client form state
  const [newClient, setNewClient] = useState({
    name: '',
    dateOfBirth: '',
    diagnosis: '',
    goals: '',
    contactInfo: '',
  });

  // Load clients
  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const allClients = await getClients();
      setClients(allClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Load selected client's data
  const selectClient = async (client) => {
    setSelectedClient(client);
    try {
      const stats = await getClientStatistics(client.id);
      setClientStats(stats);
      const notes = await getClientNotes(client.id);
      setClientNotes(notes);
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  // Create new client
  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return;
    
    try {
      console.log('Creating client:', newClient);
      const client = await createClient(newClient);
      console.log('Client created:', client);
      setClients([client, ...clients]);
      setNewClient({ name: '', dateOfBirth: '', diagnosis: '', goals: '', contactInfo: '' });
      setShowAddClient(false);
      selectClient(client);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    }
  };

  // Update client
  const handleUpdateClient = async () => {
    if (!editingClient) return;
    
    try {
      const updated = await updateClient(editingClient.id, editingClient);
      setClients(clients.map(c => c.id === updated.id ? updated : c));
      setSelectedClient(updated);
      setEditingClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  // Delete client
  const handleDeleteClient = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client and all their data?')) return;
    
    try {
      await deleteClient(clientId);
      setClients(clients.filter(c => c.id !== clientId));
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
        setClientStats(null);
        setClientNotes([]);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedClient) return;
    
    try {
      const note = await createNote({
        clientId: selectedClient.id,
        content: newNote,
        type: noteType,
      });
      setClientNotes([note, ...clientNotes]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setClientNotes(clientNotes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Note type colors
  const noteTypeColors = {
    general: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    observation: 'bg-green-500/20 text-green-300 border-green-500/30',
    goal: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    recommendation: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  return (
    <div data-testid="clients-page" className="min-h-screen bg-cobalt-gradient">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
                data-testid="nav-home-btn"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pathologist')}
                className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              >
                <Stethoscope className="w-4 h-4 mr-1" />
                Reports
              </Button>
            </div>
            
            <Button
              size="sm"
              onClick={() => setShowAddClient(true)}
              className="rounded-full bg-blue-600 hover:bg-blue-500"
              data-testid="add-client-btn"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Add Client
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-600/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Client Management
            </h1>
            <p className="text-blue-300 text-sm">Manage clients and session notes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-1">
            <Card className="bg-cobalt-surface border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Clients ({clients.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
                    <p className="text-blue-300 mb-3">No clients yet</p>
                    <Button
                      size="sm"
                      onClick={() => setShowAddClient(true)}
                      className="rounded-full bg-blue-600 hover:bg-blue-500"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add First Client
                    </Button>
                  </div>
                ) : (
                  clients.map(client => (
                    <div
                      key={client.id}
                      onClick={() => selectClient(client)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedClient?.id === client.id 
                          ? 'bg-blue-600/30 border border-blue-500/50' 
                          : 'bg-blue-900/20 border border-transparent hover:bg-blue-900/40'
                      }`}
                      data-testid={`client-${client.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-300" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{client.name}</p>
                            <p className="text-xs text-blue-400">Added {formatDate(client.createdAt)}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Client Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedClient ? (
              <>
                {/* Client Info Card */}
                <Card className="bg-cobalt-surface border-blue-500/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        {editingClient ? 'Edit Client' : selectedClient.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        {editingClient ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingClient(null)}
                              className="rounded-full text-blue-300 hover:bg-blue-600/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleUpdateClient}
                              className="rounded-full bg-green-600 hover:bg-green-500"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingClient({...selectedClient})}
                              className="rounded-full text-blue-300 hover:bg-blue-600/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClient(selectedClient.id)}
                              className="rounded-full text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingClient ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-blue-300 mb-1 block">Name</label>
                          <Input
                            value={editingClient.name}
                            onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                            className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-blue-300 mb-1 block">Date of Birth</label>
                          <Input
                            type="date"
                            value={editingClient.dateOfBirth || ''}
                            onChange={(e) => setEditingClient({...editingClient, dateOfBirth: e.target.value})}
                            className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm text-blue-300 mb-1 block">Diagnosis</label>
                          <Input
                            value={editingClient.diagnosis || ''}
                            onChange={(e) => setEditingClient({...editingClient, diagnosis: e.target.value})}
                            className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                            placeholder="e.g., Articulation disorder, Speech delay"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm text-blue-300 mb-1 block">Goals</label>
                          <textarea
                            value={editingClient.goals || ''}
                            onChange={(e) => setEditingClient({...editingClient, goals: e.target.value})}
                            className="w-full h-20 rounded-xl border border-blue-500/30 bg-[#0f2847] text-white p-3 resize-none"
                            placeholder="Treatment goals..."
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm text-blue-300 mb-1 block">Contact Info</label>
                          <Input
                            value={editingClient.contactInfo || ''}
                            onChange={(e) => setEditingClient({...editingClient, contactInfo: e.target.value})}
                            className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                            placeholder="Phone, email, or guardian info"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-900/20 rounded-xl">
                          <p className="text-xs text-blue-400 mb-1">Date of Birth</p>
                          <p className="text-white">{formatDate(selectedClient.dateOfBirth) || 'Not set'}</p>
                        </div>
                        <div className="p-3 bg-blue-900/20 rounded-xl">
                          <p className="text-xs text-blue-400 mb-1">Diagnosis</p>
                          <p className="text-white">{selectedClient.diagnosis || 'Not set'}</p>
                        </div>
                        <div className="col-span-2 p-3 bg-blue-900/20 rounded-xl">
                          <p className="text-xs text-blue-400 mb-1">Goals</p>
                          <p className="text-white">{selectedClient.goals || 'No goals set'}</p>
                        </div>
                        <div className="col-span-2 p-3 bg-blue-900/20 rounded-xl">
                          <p className="text-xs text-blue-400 mb-1">Contact</p>
                          <p className="text-white">{selectedClient.contactInfo || 'No contact info'}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics */}
                {clientStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-cobalt-surface border-blue-500/20">
                      <CardContent className="p-4 text-center">
                        <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{clientStats.totalSessions}</p>
                        <p className="text-xs text-blue-300">Sessions</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-cobalt-surface border-blue-500/20">
                      <CardContent className="p-4 text-center">
                        <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{clientStats.avgVisualScore}%</p>
                        <p className="text-xs text-blue-300">Avg Visual</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-cobalt-surface border-blue-500/20">
                      <CardContent className="p-4 text-center">
                        <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{clientStats.avgAudioScore}%</p>
                        <p className="text-xs text-blue-300">Avg Audio</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-cobalt-surface border-blue-500/20">
                      <CardContent className="p-4 text-center">
                        <Calendar className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-white">{formatDate(clientStats.lastSession)}</p>
                        <p className="text-xs text-blue-300">Last Session</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Session Notes */}
                <Card className="bg-cobalt-surface border-blue-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      Session Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Note Form */}
                    <div className="p-4 bg-blue-900/20 rounded-xl space-y-3">
                      <div className="flex gap-2">
                        <Select value={noteType} onValueChange={setNoteType}>
                          <SelectTrigger className="w-40 rounded-xl border-blue-500/30 bg-[#0f2847] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="observation">Observation</SelectItem>
                            <SelectItem value="goal">Goal Update</SelectItem>
                            <SelectItem value="recommendation">Recommendation</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                        />
                        <Button
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="rounded-xl bg-blue-600 hover:bg-blue-500"
                          data-testid="add-note-btn"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Notes List */}
                    {clientNotes.length === 0 ? (
                      <p className="text-center text-blue-400 py-4">No notes yet</p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {clientNotes.map(note => (
                          <div key={note.id} className={`p-3 rounded-xl border ${noteTypeColors[note.type]}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium uppercase">{note.type}</span>
                                  <span className="text-xs opacity-60">{formatDate(note.timestamp)}</span>
                                </div>
                                <p className="text-sm">{note.content}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                className="rounded-full text-red-400 hover:bg-red-500/20 h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate('/letter-practice')}
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500"
                  >
                    Start Letter Practice
                  </Button>
                  <Button
                    onClick={() => navigate('/pathologist')}
                    variant="outline"
                    className="flex-1 rounded-xl border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
                  >
                    Generate Report
                  </Button>
                </div>
              </>
            ) : (
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardContent className="p-12 text-center">
                  <User className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Client</h3>
                  <p className="text-blue-300 mb-4">Choose a client from the list to view their details and notes</p>
                  {clients.length === 0 && (
                    <Button
                      onClick={() => setShowAddClient(true)}
                      className="rounded-full bg-blue-600 hover:bg-blue-500"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Your First Client
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg mx-4 bg-cobalt-surface border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  Add New Client
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddClient(false)}
                  className="rounded-full text-blue-300 hover:bg-blue-600/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-blue-300 mb-1 block">Client Name *</label>
                <Input
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Full name"
                  className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-blue-300 mb-1 block">Date of Birth</label>
                  <Input
                    type="date"
                    value={newClient.dateOfBirth}
                    onChange={(e) => setNewClient({...newClient, dateOfBirth: e.target.value})}
                    className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-blue-300 mb-1 block">Diagnosis</label>
                  <Input
                    value={newClient.diagnosis}
                    onChange={(e) => setNewClient({...newClient, diagnosis: e.target.value})}
                    placeholder="e.g., Articulation"
                    className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-300 mb-1 block">Treatment Goals</label>
                <textarea
                  value={newClient.goals}
                  onChange={(e) => setNewClient({...newClient, goals: e.target.value})}
                  placeholder="What are the therapy goals for this client?"
                  className="w-full h-20 rounded-xl border border-blue-500/30 bg-[#0f2847] text-white p-3 resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-blue-300 mb-1 block">Contact Info</label>
                <Input
                  value={newClient.contactInfo}
                  onChange={(e) => setNewClient({...newClient, contactInfo: e.target.value})}
                  placeholder="Phone, email, or guardian contact"
                  className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddClient(false)}
                  className="flex-1 rounded-xl border-blue-500/30 text-blue-300"
                  data-testid="cancel-add-client-btn"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClient}
                  disabled={!newClient.name.trim()}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500"
                  data-testid="submit-add-client-btn"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
