import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ResumePDF from './ResumePDF';

const ResumeDownload = () => {
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState({
    personalInfo: {},
    skills: [],
    workExperience: [],
    education: [],
    languages: [],
    hobbies: [],
    profile: {},
    journeyContent: null
  });

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        
        // Fetch skills
        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .order('proficiency', { ascending: false });
        
        // Fetch work experience
        const { data: workData } = await supabase
          .from('work_experience')
          .select('*')
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });
        
        // Fetch education
        const { data: educationData } = await supabase
          .from('education')
          .select('*')
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });
        
        // Fetch personal info
        const { data: personalInfoData } = await supabase
          .from('personal_info')
          .select('*')
          .single();
        
        // Fetch languages
        const { data: languagesData } = await supabase
          .from('languages')
          .select('*')
          .order('is_native', { ascending: false });
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .single();
        
        // Fetch hobbies
        const { data: hobbiesData } = await supabase
          .from('hobbies')
          .select('*');
          
        // Fetch journey content
        const { data: journeyData } = await supabase
          .from('journey_content')
          .select('*')
          .single();
        
        // Process the data to ensure tags are arrays
        const processedWorkData = workData ? workData.map(w => ({
          ...w,
          tags: Array.isArray(w.tags) ? w.tags : [],
        })) : [];
        
        const processedEducationData = educationData ? educationData.map(e => ({
          ...e,
          tags: Array.isArray(e.tags) ? e.tags : [],
        })) : [];
        
        setResumeData({
          personalInfo: personalInfoData || {},
          skills: skillsData || [],
          workExperience: processedWorkData,
          education: processedEducationData,
          languages: languagesData || [],
          hobbies: hobbiesData || [],
          profile: profileData || {},
          journeyContent: journeyData || null
        });
      } catch (error) {
        console.error('Error fetching resume data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  return (
    <div className="resume-download">
      {loading ? (
        <Button disabled>
          <FileText className="mr-2 h-5 w-5 animate-pulse" />
          Loading Resume...
        </Button>
      ) : (
        <PDFDownloadLink
          document={
            <ResumePDF
              personalInfo={resumeData.personalInfo}
              skills={resumeData.skills}
              workExperience={resumeData.workExperience}
              education={resumeData.education}
              languages={resumeData.languages}
              hobbies={resumeData.hobbies}
              profile={resumeData.profile}
              journeyContent={resumeData.journeyContent}
            />
          }
          fileName={`${resumeData.personalInfo.full_name || 'resume'}.pdf`}
          className="inline-block"
        >
          {({ blob, url, loading, error }) => (
            <Button
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? (
                <>
                  <FileText className="mr-2 h-5 w-5 animate-pulse" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Resume
                </>
              )}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default ResumeDownload;