import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PersonalInfo {
  email: string | null;
  phone: string | null;
  location: string | null;
  github: string | null;
  linkedin: string | null;
}

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: null,
    phone: null,
    location: null,
    github: null,
    linkedin: null
  });
  const [infoLoading, setInfoLoading] = useState(true);
  
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      setInfoLoading(true);
      try {
        const { data, error } = await supabase
          .from('personal_info')
          .select('email, phone, location, github, linkedin')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching personal info:", error);
        } else if (data) {
          setPersonalInfo({
            email: data.email,
            phone: data.phone,
            location: data.location,
            github: data.github,
            linkedin: data.linkedin
          });
        }
      } catch (error) {
        console.error("Error fetching personal info:", error);
      } finally {
        setInfoLoading(false);
      }
    };

    fetchPersonalInfo();
  }, []);

  // Format URLs if they don't start with http:// or https://
  const getGithubUrl = () => {
    if (!personalInfo.github) return "https://github.com";
    return personalInfo.github.startsWith('http') ? 
      personalInfo.github : 
      `https://github.com/${personalInfo.github}`;
  };

  const getLinkedinUrl = () => {
    if (!personalInfo.linkedin) return "https://linkedin.com";
    return personalInfo.linkedin.startsWith('http') ? 
      personalInfo.linkedin : 
      `https://linkedin.com/in/${personalInfo.linkedin}`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Submit message to contact_messages table
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name,
            email,
            subject,
            message
          }
        ]);
      
      if (error) {
        console.error("Error submitting message:", error);
        toast({
          title: "Error",
          description: "There was a problem sending your message. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Message sent!",
          description: "Thank you for your message. I'll get back to you soon."
        });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (error) {
      console.error("Error submitting message:", error);
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-16 animate-on-scroll">
          <h1 className="text-4xl font-bold mb-4">Contact Me</h1>
          <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
          <p className="text-muted-foreground max-w-2xl">
            Have a question or want to work together? Drop me a message and I'll get back to you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="animate-on-scroll">
            <Card className="border-secondary bg-secondary/20 h-full">
              <CardHeader>
                <CardTitle>Get In Touch</CardTitle>
                <CardDescription>
                  Fill out the form and I'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="Message subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Your message"
                      className="min-h-32"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          <div className="animate-on-scroll">
            <Card className="border-secondary bg-secondary/20 h-full">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Here are different ways you can get in touch with me.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <span className="text-lg font-medium">Email</span>
                  <a href={`mailto:${personalInfo.email || 'contact@example.com'}`} className="text-primary hover:underline">
                    {personalInfo.email || 'contact@example.com'}
                  </a>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <span className="text-lg font-medium">Phone</span>
                  <a href={`tel:${personalInfo.phone || '+1234567890'}`} className="text-primary hover:underline">
                    {personalInfo.phone || '+1 (234) 567-890'}
                  </a>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <span className="text-lg font-medium">Location</span>
                  <span>{personalInfo.location || 'San Francisco, CA'}</span>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <span className="text-lg font-medium">Social Media</span>
                  <div className="flex gap-4">
                    {personalInfo.github && (
                      <a href={getGithubUrl()} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                        </svg>
                      </a>
                    )}
                    {personalInfo.linkedin && (
                      <a href={getLinkedinUrl()} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      </a>
                    )}
                    {!personalInfo.github && !personalInfo.linkedin && (
                      <span className="text-sm text-muted-foreground">No social media links available</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-8 bg-secondary/20 border border-secondary rounded-lg aspect-video">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.507640613356!3d37.75781499644896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1667791471195!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
