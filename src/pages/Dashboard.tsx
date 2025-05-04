import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  UserCircle,
  Briefcase,
  GraduationCap,
  Code2,
  MessageSquare,
  BookOpen,
  Globe,
  Heart,
  FileBadge,
  LogOut,
  ChevronRight,
  Home,
  Settings,
  LineChart,
  Users,
  ArrowUp,
  Eye,
  TrendingUp,
  Clock,
  ExternalLink,
  Mail,
  Inbox,
  CheckCheck,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

// Import all dialog components
import EditProfileDialog from '@/components/dashboard/EditProfileDialog';
import ManageProjectsDialog from '@/components/dashboard/ManageProjectsDialog';
import ManageSkillsDialog from '@/components/dashboard/ManageSkillsDialog';
import ManageWorkExperienceDialog from '@/components/dashboard/ManageWorkExperienceDialog';
import ManageEducationDialog from '@/components/dashboard/ManageEducationDialog';
import ManagePersonalInfoDialog from '@/components/dashboard/ManagePersonalInfoDialog';
import ManageLanguagesDialog from '@/components/dashboard/ManageLanguagesDialog';
import ManageHobbiesDialog from '@/components/dashboard/ManageHobbiesDialog';
import ManageJourneyDialog from '@/components/dashboard/ManageJourneyDialog';
import ManageContactMessagesDialog from '@/components/dashboard/ManageContactMessagesDialog';

// DashboardCard component for improved stat cards
interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
  isLoading?: boolean;
  color?: "default" | "primary" | "success" | "warning" | "danger";
}

const DashboardCard = ({
  title,
  value,
  icon,
  trend = 0,
  description,
  isLoading = false,
  color = "default"
}: DashboardCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "success":
        return "bg-emerald-100 text-emerald-700";
      case "warning":
        return "bg-amber-100 text-amber-700";
      case "danger":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-muted/30 text-foreground";
    }
  };

  const getTrendColor = () => {
    if (trend > 0) return "text-emerald-600";
    if (trend < 0) return "text-rose-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          )}
        </div>
        <div className={`p-2 rounded-md ${getColorClasses()}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 bg-muted/60 rounded animate-pulse" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${getTrendColor()}`}>
                {trend > 0 ? <ArrowUp className="h-3 w-3" /> : trend < 0 ? <ArrowUp className="h-3 w-3 rotate-180" /> : null}
                <span>{Math.abs(trend)}% from last month</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// New interface for contact messages
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  whatsapp: string;
  read: boolean;
  created_at: string;
}

interface PersonalInfo {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  github: string | null;
  linkedin: string | null;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: null,
    phone: null,
    whatsapp: null,
    location: null,
    github: null,
    linkedin: null
  });
  const [personalInfoLoading, setPersonalInfoLoading] = useState(false);

  // Mock stats data (in a real app, this would come from an API)
  const stats = {
    projects: 3,
    skills: 12,
    messages: messages.filter(m => !m.read).length,
    visitors: 215
  };

  // Dialog state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isManageProjectsOpen, setIsManageProjectsOpen] = useState(false);
  const [isManageSkillsOpen, setIsManageSkillsOpen] = useState(false);
  const [isManageWorkExperienceOpen, setIsManageWorkExperienceOpen] = useState(false);
  const [isManageEducationOpen, setIsManageEducationOpen] = useState(false);
  const [isManagePersonalInfoOpen, setIsManagePersonalInfoOpen] = useState(false);
  const [isManageLanguagesOpen, setIsManageLanguagesOpen] = useState(false);
  const [isManageHobbiesOpen, setIsManageHobbiesOpen] = useState(false);
  const [isManageJourneyOpen, setIsManageJourneyOpen] = useState(false);
  const [isManageContactMessagesOpen, setIsManageContactMessagesOpen] = useState(false);

  // Fetch contact messages when the messages tab is active
  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
      fetchPersonalInfo();
    }
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      setMessagesLoading(true);
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
      setMessagesLoading(false);
    }
  };

  const fetchPersonalInfo = async () => {
    try {
      setPersonalInfoLoading(true);
      const { data, error } = await supabase
        .from('personal_info')
        .select('email, phone, whatsapp, location, github, linkedin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching personal info:", error);
      } else if (data) {
        setPersonalInfo({
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp,
          location: data.location,
          github: data.github,
          linkedin: data.linkedin
        });
      }
    } catch (error) {
      console.error("Error fetching personal info:", error);
    } finally {
      setPersonalInfoLoading(false);
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

      // If this is the selected message, update it too
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({
          ...selectedMessage,
          read: !currentStatus
        });
      }

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

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setMessages(messages.filter(message => message.id !== id));

      // If this is the selected message, clear selection
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }

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
    }
  };

  const selectMessage = (message: ContactMessage) => {
    setSelectedMessage(message);

    // Mark as read if it's unread
    if (!message.read) {
      toggleReadStatus(message.id, false);
    }
  };

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  const goToHomePage = () => {
    navigate('/');
  };

  // Dashboard menu items for content management
  const contentItems = [
    {
      id: "profile",
      name: "Profile",
      description: "Edit your personal profile",
      icon: <UserCircle className="h-5 w-5" />,
      onClick: () => setIsEditProfileOpen(true)
    },
    {
      id: "personal-info",
      name: "Personal Info",
      description: "Contact details, location, etc.",
      icon: <FileBadge className="h-5 w-5" />,
      onClick: () => setIsManagePersonalInfoOpen(true)
    },
    {
      id: "projects",
      name: "Projects",
      description: "Showcase your work portfolio",
      icon: <Code2 className="h-5 w-5" />,
      onClick: () => setIsManageProjectsOpen(true)
    },
    {
      id: "skills",
      name: "Skills",
      description: "Technical abilities and expertise",
      icon: <BarChart3 className="h-5 w-5" />,
      onClick: () => setIsManageSkillsOpen(true)
    },
    {
      id: "experience",
      name: "Work Experience",
      description: "Professional history",
      icon: <Briefcase className="h-5 w-5" />,
      onClick: () => setIsManageWorkExperienceOpen(true)
    },
    {
      id: "education",
      name: "Education",
      description: "Academic background",
      icon: <GraduationCap className="h-5 w-5" />,
      onClick: () => setIsManageEducationOpen(true)
    },
    {
      id: "languages",
      name: "Languages",
      description: "Language proficiencies",
      icon: <Globe className="h-5 w-5" />,
      onClick: () => setIsManageLanguagesOpen(true)
    },
    {
      id: "journey",
      name: "My Journey",
      description: "Your professional story",
      icon: <BookOpen className="h-5 w-5" />,
      onClick: () => setIsManageJourneyOpen(true)
    },
    {
      id: "hobbies",
      name: "Hobbies",
      description: "Interests and activities",
      icon: <Heart className="h-5 w-5" />,
      onClick: () => setIsManageHobbiesOpen(true)
    }
  ];

  return (
    <Layout hideFooter={true} hideNavBar={true}>
      <div className="flex flex-col md:flex-row h-screen bg-muted/10">
        {/* Dashboard Sidebar */}
        <div className="hidden md:flex w-64 flex-col border-r bg-background shrink-0">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Manage your portfolio</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              <div className="space-y-1 py-2">
                <Button
                  onClick={() => setActiveTab("overview")}
                  variant={activeTab === "overview" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 font-normal"
                >
                  <Home className="h-4 w-4" /> Overview
                </Button>
                <Button
                  onClick={() => setActiveTab("manage")}
                  variant={activeTab === "manage" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 font-normal"
                >
                  <Settings className="h-4 w-4" /> Manage Content
                </Button>
                <Button
                  onClick={() => setActiveTab("messages")}
                  variant={activeTab === "messages" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 font-normal"
                >
                  <MessageSquare className="h-4 w-4" /> Messages
                  {stats.messages > 0 && (
                    <Badge variant="secondary" className="ml-auto">{stats.messages}</Badge>
                  )}
                </Button>
                <Button
                  onClick={() => setActiveTab("analytics")}
                  variant={activeTab === "analytics" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 font-normal"
                >
                  <LineChart className="h-4 w-4" /> Analytics
                </Button>
                <Button
                  onClick={goToHomePage}
                  variant="ghost"
                  className="w-full justify-start gap-2 font-normal"
                >
                  <ExternalLink className="h-4 w-4" /> View Portfolio
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1 py-2">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">USER</p>
                <div className="px-2 py-2 rounded-md bg-accent/50">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-normal mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area - Single Scroll Container */}
        <ScrollArea className="flex-1 h-full">
          {/* Fixed Mobile Navigation */}
          <div className="md:hidden sticky top-0 z-10 bg-background border-b">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goToHomePage}>
                  <ExternalLink className="h-4 w-4 mr-1" /> View Site
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
              </div>
            </div>
          </div>

          {/* Tab Content with unified Tabs component */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile Navigation TabsList */}
            <div className="md:hidden border-b">
              <TabsList className="w-full justify-around rounded-none border-0">
                <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-muted">
                  <Home className="h-4 w-4 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger value="manage" className="flex-1 data-[state=active]:bg-muted">
                  <Settings className="h-4 w-4 mr-2" /> Manage
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex-1 data-[state=active]:bg-muted">
                  <MessageSquare className="h-4 w-4 mr-2" /> Messages
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1 data-[state=active]:bg-muted">
                  <LineChart className="h-4 w-4 mr-2" /> Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Welcome back!</h1>
                  <p className="text-muted-foreground">Here's an overview of your portfolio.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                  title="Total Projects"
                  value={stats.projects}
                  icon={<Code2 className="h-5 w-5" />}
                  trend={12}
                  color="primary"
                />
                <DashboardCard
                  title="Skills Listed"
                  value={stats.skills}
                  icon={<BarChart3 className="h-5 w-5" />}
                  trend={5}
                  color="success"
                />
                <DashboardCard
                  title="Unread Messages"
                  value={stats.messages}
                  icon={<MessageSquare className="h-5 w-5" />}
                  description="From contact form"
                  color="warning"
                />
                <DashboardCard
                  title="Portfolio Visitors"
                  value={stats.visitors}
                  icon={<Users className="h-5 w-5" />}
                  description="This month"
                  trend={18}
                  color="success"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>Latest updates from your portfolio</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">24 new profile views</p>
                        <p className="text-xs text-muted-foreground">Today at 2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">New contact message received</p>
                        <p className="text-xs text-muted-foreground">Yesterday at 5:12 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Portfolio traffic increased by 15%</p>
                        <p className="text-xs text-muted-foreground">This week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Overview</CardTitle>
                    <CardDescription>Status of your portfolio content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-amber-100">
                          <Briefcase className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <span className="text-sm">Work Experience</span>
                      </div>
                      <span className="text-sm font-medium">2 entries</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-blue-100">
                          <Code2 className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm">Projects</span>
                      </div>
                      <span className="text-sm font-medium">3 projects</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-emerald-100">
                          <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <span className="text-sm">Education</span>
                      </div>
                      <span className="text-sm font-medium">1 entry</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-rose-100">
                          <Clock className="h-3.5 w-3.5 text-rose-600" />
                        </div>
                        <span className="text-sm">Last Updated</span>
                      </div>
                      <span className="text-sm font-medium">2 days ago</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("manage")}>
                      Manage All Content
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <h2 className="text-xl font-semibold mt-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {contentItems.slice(0, 4).map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-primary/10 rounded-md">
                          {item.icon}
                        </div>
                      </div>
                      <CardTitle className="text-md">{item.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 border-t">
                      <Button
                        onClick={item.onClick}
                        variant="ghost"
                        className="w-full justify-between"
                        size="sm"
                      >
                        Manage
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="manage" className="p-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Content</h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-md">
                          {item.icon}
                        </div>
                        <div>
                          <CardTitle className="text-md">{item.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button
                        onClick={item.onClick}
                        variant="default"
                        className="w-full"
                      >
                        Manage {item.name}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="focus-visible:outline-none focus-visible:ring-0 h-[calc(100vh-4rem)] md:h-screen">
              <div className="flex flex-col md:flex-row h-full">
                {/* Messages list */}
                <div className="h-[40vh] md:h-full w-full md:w-2/5 lg:w-1/3 border-r flex flex-col">
                  <div className="p-4 border-b shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Inbox className="h-5 w-5" /> Messages
                      {stats.messages > 0 && (
                        <Badge variant="secondary">{stats.messages} unread</Badge>
                      )}
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {messagesLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        No messages found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            onClick={() => selectMessage(message)}
                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors
                              ${selectedMessage?.id === message.id ? 'bg-muted/50' : ''}
                              ${!message.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h3 className={`font-medium ${!message.read ? 'font-semibold' : ''}`}>
                                {message.subject || 'No Subject'}
                              </h3>
                              {!message.read && (
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {message.name} - {message.message.substring(0, 40)}...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message detail */}
                <div className="flex-1 h-[calc(60vh-5rem)] md:h-full flex flex-col">
                  {selectedMessage ? (
                    <>
                      <div className="p-4 border-b flex justify-between items-center shrink-0">
                        <div>
                          <h2 className="text-xl font-semibold">{selectedMessage.subject || 'No Subject'}</h2>
                          <p className="text-sm text-muted-foreground">From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReadStatus(selectedMessage.id, selectedMessage.read)}
                          >
                            {selectedMessage.read ? (
                              <>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Mark as Unread
                              </>
                            ) : (
                              <>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark as Read
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteMessage(selectedMessage.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                      <div className="p-6 overflow-y-auto flex-1">
                        <div className="mb-6 text-sm text-muted-foreground">
                          Received {formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
                        </div>
                        <div className="whitespace-pre-wrap mb-6">
                          {selectedMessage.message}
                        </div>

                        {/* Contact options based on what the user provided */}
                        <div className="mt-4 grid gap-4">
                          {selectedMessage.whatsapp && (
                            <div className="p-4 bg-green-50 rounded-md border border-green-200">
                              <h4 className="text-sm font-medium text-green-800 mb-2">WhatsApp Contact</h4>
                              <p className="text-sm text-green-700 mb-3">
                                {selectedMessage.whatsapp}
                              </p>
                              <a
                                href={`https://wa.me/${selectedMessage.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Reply via WhatsApp
                              </a>
                            </div>
                          )}

                          {selectedMessage.email && (
                            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                              <h4 className="text-sm font-medium text-blue-800 mb-2">Email Contact</h4>
                              <p className="text-sm text-blue-700 mb-3">
                                {selectedMessage.email}
                              </p>

                              {/* Professional email draft template with signature */}
                              <div className="mb-3 bg-white p-3 rounded border border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm font-medium">Professional Email Template</div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7 px-2"
                                    onClick={() => {
                                      // Get user's name from personal info (fallback to a generic name)
                                      const userName = user?.user_metadata?.full_name || "Mustaqeem";

                                      // Create professional draft text with signature
                                      const subject = `Re: ${selectedMessage.subject || 'Your message'}`;
                                      const signature = `
Best regards,

${userName}
${personalInfo.email || ""}
${personalInfo.phone || ""}
${personalInfo.location || ""}
${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://linkedin.com/in/${personalInfo.linkedin}`}` : ""}
`;

                                      const body = `Dear ${selectedMessage.name},

[Your professional response here]

Thank you for reaching out. I appreciate your interest and will address your inquiry promptly.

${signature}

--------------------
Original message:
Subject: ${selectedMessage.subject || 'Your message'}
From: ${selectedMessage.name} <${selectedMessage.email}>
Message:
${selectedMessage.message}`;

                                      // Copy to clipboard
                                      navigator.clipboard.writeText(body);
                                      toast({
                                        title: "Copied to clipboard",
                                        description: "The professional email template has been copied to your clipboard"
                                      });
                                    }}
                                  >
                                    Copy to Clipboard
                                  </Button>
                                </div>
                                <div className="text-xs mb-2">
                                  <span className="font-medium">To:</span> {selectedMessage.email}<br />
                                  <span className="font-medium">Subject:</span> Re: {selectedMessage.subject || 'Your message'}<br />
                                  <span className="font-medium">Cc:</span> <span className="text-muted-foreground">[Optional]</span>
                                </div>
                                <div className="text-xs whitespace-pre-wrap border-t pt-2 text-muted-foreground">
                                  <p className="mb-2">Dear {selectedMessage.name},</p>

                                  <p className="mb-4 text-blue-600 italic">[Your professional response here]</p>

                                  <p className="mb-4">Thank you for reaching out. I appreciate your interest and will address your inquiry promptly.</p>

                                  <div className="border-t pt-2 mb-4">
                                    <p className="font-medium mb-1">Best regards,</p>
                                    <p className="mb-0">{user?.user_metadata?.full_name || "Mustaqeem"}</p>
                                    {personalInfo.email && <p className="mb-0">{personalInfo.email}</p>}
                                    {personalInfo.phone && <p className="mb-0">{personalInfo.phone}</p>}
                                    {personalInfo.location && <p className="mb-0">{personalInfo.location}</p>}
                                    {personalInfo.linkedin && (
                                      <p className="mb-0">LinkedIn: {personalInfo.linkedin.startsWith('http') ?
                                        personalInfo.linkedin :
                                        `https://linkedin.com/in/${personalInfo.linkedin}`}
                                      </p>
                                    )}
                                  </div>

                                  <div className="border-t border-dashed pt-2 text-gray-500">
                                    <p className="font-medium mb-1">Original message:</p>
                                    <p className="mb-0"><strong>Subject:</strong> {selectedMessage.subject || 'Your message'}</p>
                                    <p className="mb-0"><strong>From:</strong> {selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
                                    <p className="mb-1"><strong>Message:</strong></p>
                                    <p className="pl-2 border-l-2 border-gray-300">{selectedMessage.message}</p>
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                  // Get user's name from personal info (fallback to a generic name)
                                  const userName = user?.user_metadata?.full_name || "Mustaqeem";

                                  // Create signature
                                  const signature = `
Best regards,

${userName}
${personalInfo.email || ""}
${personalInfo.phone || ""}
${personalInfo.location || ""}
${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://linkedin.com/in/${personalInfo.linkedin}`}` : ""}`;

                                  // Create email body with signature
                                  const body = `Dear ${selectedMessage.name},

[Your professional response here]

Thank you for reaching out. I appreciate your interest and will address your inquiry promptly.

${signature}

--------------------
Original message:
Subject: ${selectedMessage.subject || 'Your message'}
From: ${selectedMessage.name} <${selectedMessage.email}>
Message:
${selectedMessage.message}`;

                                  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedMessage.email)}&su=${encodeURIComponent(`Re: ${selectedMessage.subject || 'Your message'}`)}&body=${encodeURIComponent(body)}`, '_blank');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <rect width="20" height="16" x="2" y="4" rx="2" />
                                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                Open in Gmail
                              </Button>
                            </div>
                          )}

                          {!selectedMessage.email && !selectedMessage.whatsapp && (
                            <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
                              <h4 className="text-sm font-medium text-amber-800 mb-2">No Contact Method Provided</h4>
                              <p className="text-sm text-amber-700">
                                This message doesn't contain any contact information. You won't be able to reply directly.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                      <Mail className="h-12 w-12 mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-medium mb-2">Select a message</h3>
                      <p>Choose a message from the list to view its contents</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="p-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Analytics</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <DashboardCard
                  title="Portfolio Visitors"
                  value={stats.visitors}
                  icon={<Users className="h-5 w-5" />}
                  description="This month"
                  trend={18}
                  color="success"
                />
                <DashboardCard
                  title="Average Time on Site"
                  value="2m 45s"
                  icon={<Clock className="h-5 w-5" />}
                  description="Per visit"
                  trend={-3}
                  color="warning"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Statistics</CardTitle>
                  <CardDescription>View insights about your portfolio performance</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-10">
                  <p className="text-muted-foreground">Detailed analytics feature coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Dialogs */}
      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
      />

      <ManagePersonalInfoDialog
        open={isManagePersonalInfoOpen}
        onOpenChange={setIsManagePersonalInfoOpen}
      />

      <ManageLanguagesDialog
        open={isManageLanguagesOpen}
        onOpenChange={setIsManageLanguagesOpen}
      />

      <ManageProjectsDialog
        open={isManageProjectsOpen}
        onOpenChange={setIsManageProjectsOpen}
      />

      <ManageSkillsDialog
        open={isManageSkillsOpen}
        onOpenChange={setIsManageSkillsOpen}
      />

      <ManageWorkExperienceDialog
        open={isManageWorkExperienceOpen}
        onOpenChange={setIsManageWorkExperienceOpen}
      />

      <ManageEducationDialog
        open={isManageEducationOpen}
        onOpenChange={setIsManageEducationOpen}
      />

      <ManageHobbiesDialog
        open={isManageHobbiesOpen}
        onOpenChange={setIsManageHobbiesOpen}
      />

      <ManageJourneyDialog
        open={isManageJourneyOpen}
        onOpenChange={setIsManageJourneyOpen}
      />

      <ManageContactMessagesDialog
        open={isManageContactMessagesOpen}
        onOpenChange={setIsManageContactMessagesOpen}
      />
    </Layout>
  );
};

export default Dashboard;
