
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send,
  Plus,
  Search,
  User,
  Clock,
  CheckCircle,
  Reply,
  Paperclip
} from 'lucide-react';
import ClientPortalLayout from '@/components/ClientPortalLayout';
import { useToast } from '@/hooks/use-toast';

const ClientMessages: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [newMessageProjectId, setNewMessageProjectId] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserInfo();
    fetchMessages();
    fetchProjects();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserInfo = async () => {
    try {
      const { data: userInfo, error } = await window.ezsite.apis.getUserInfo();
      if (error) throw new Error(error);
      setUser(userInfo);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(34883, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);
      setMessages(data?.List || []);
    } catch (error: any) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (!error && data?.List) {
        setProjects(data.List);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(34883, {
        id: messageId,
        read_status: true
      });

      if (!error) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, read_status: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageSubject.trim() || !newMessageContent.trim() || !user) return;

    setIsSending(true);
    try {
      const messageData = {
        sender_id: user.ID,
        receiver_id: 1, // Assuming admin/contractor ID is 1
        project_id: newMessageProjectId ? parseInt(newMessageProjectId) : null,
        subject: newMessageSubject.trim(),
        content: newMessageContent.trim(),
        read_status: false,
        created_at: new Date().toISOString()
      };

      const { error } = await window.ezsite.apis.tableCreate(34883, messageData);
      if (error) throw new Error(error);

      toast({
        title: "Message sent successfully",
        description: "Your message has been sent to the project team.",
      });

      // Reset form
      setNewMessageSubject('');
      setNewMessageContent('');
      setNewMessageProjectId('');
      setIsComposeModalOpen(false);
      
      // Refresh messages
      fetchMessages();

    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
      const replyData = {
        sender_id: user.ID,
        receiver_id: selectedConversation.sender_id === user.ID ? selectedConversation.receiver_id : selectedConversation.sender_id,
        project_id: selectedConversation.project_id,
        subject: `Re: ${selectedConversation.subject}`,
        content: replyContent.trim(),
        read_status: false,
        created_at: new Date().toISOString()
      };

      const { error } = await window.ezsite.apis.tableCreate(34883, replyData);
      if (error) throw new Error(error);

      toast({
        title: "Reply sent successfully",
        description: "Your reply has been sent.",
      });

      setReplyContent('');
      fetchMessages();

    } catch (error: any) {
      toast({
        title: "Failed to send reply",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'General';
  };

  const groupMessagesByConversation = () => {
    const conversations: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const key = message.subject.startsWith('Re: ') 
        ? message.subject.replace('Re: ', '')
        : message.subject;
      
      if (!conversations[key]) {
        conversations[key] = [];
      }
      conversations[key].push(message);
    });

    return Object.entries(conversations).map(([subject, msgs]) => ({
      subject,
      messages: msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      lastMessage: msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0],
      unreadCount: msgs.filter(m => !m.read_status && m.receiver_id === user?.ID).length
    }));
  };

  const filteredConversations = groupMessagesByConversation().filter(conv =>
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation);
    // Mark unread messages as read
    conversation.messages.forEach((msg: any) => {
      if (!msg.read_status && msg.receiver_id === user?.ID) {
        markAsRead(msg.id);
      }
    });
  };

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="h-[calc(100vh-200px)]">
        <div className="flex h-full gap-4">
          {/* Messages List */}
          <Card className="w-1/3 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
                <Button size="sm" onClick={() => setIsComposeModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {filteredConversations.map((conversation, index) => (
                    <div
                      key={index}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.subject === conversation.subject
                          ? 'bg-primary/10 border-primary/20 border'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium truncate">{conversation.subject}</h4>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>
                          {conversation.lastMessage.project_id && 
                            getProjectName(conversation.lastMessage.project_id)
                          }
                        </span>
                        <span>
                          {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No messages</h3>
                      <p className="text-sm text-muted-foreground">
                        Start a conversation with your project team.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Conversation View */}
          <Card className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedConversation.subject}</CardTitle>
                      {selectedConversation.messages[0]?.project_id && (
                        <Badge variant="outline" className="mt-1">
                          {getProjectName(selectedConversation.messages[0].project_id)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.ID ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === user?.ID
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-2 mt-2 text-xs ${
                              message.sender_id === user?.ID
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}>
                              <Clock className="h-3 w-3" />
                              <span>{new Date(message.created_at).toLocaleString()}</span>
                              {message.read_status && message.sender_id === user?.ID && (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Reply Box */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="flex-1"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                      />
                      <Button
                        onClick={sendReply}
                        disabled={!replyContent.trim() || isSending}
                        size="sm"
                        className="self-end"
                      >
                        {isSending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list to view messages.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Compose Modal */}
        <Dialog open={isComposeModalOpen} onOpenChange={setIsComposeModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <Label htmlFor="project">Project (Optional)</Label>
                <Select value={newMessageProjectId} onValueChange={setNewMessageProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                  placeholder="Enter message subject"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Message *</Label>
                <Textarea
                  id="content"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Enter your message"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSending} className="flex-1">
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsComposeModalOpen(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ClientPortalLayout>
  );
};

export default ClientMessages;
