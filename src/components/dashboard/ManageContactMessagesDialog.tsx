import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ManageContactMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

const ManageContactMessagesDialog = ({ open, onOpenChange }: ManageContactMessagesDialogProps) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch messages when dialog opens
  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to load contact messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setMessages(messages.map(message => 
        message.id === id ? { ...message, read: !currentStatus } : message
      ));

      toast({
        title: "Success",
        description: `Message marked as ${!currentStatus ? 'read' : 'unread'}`,
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (id: string) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageToDelete);

      if (error) {
        throw error;
      }

      // Update local state
      setMessages(messages.filter(message => message.id !== messageToDelete));

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Messages</DialogTitle>
            <DialogDescription>
              Manage messages sent through your contact form
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages found
              </div>
            ) : (
              messages.map((message) => (
                <Card key={message.id} className={`border ${message.read ? 'border-border' : 'border-primary'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{message.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          From: {message.name} ({message.email})
                        </p>
                      </div>
                      <Badge variant={message.read ? "outline" : "default"}>
                        {message.read ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 mb-4">
                      <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant={message.read ? "outline" : "secondary"}
                          size="sm" 
                          onClick={() => toggleReadStatus(message.id, message.read)}
                        >
                          {message.read ? 'Mark as Unread' : 'Mark as Read'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => confirmDelete(message.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageContactMessagesDialog;