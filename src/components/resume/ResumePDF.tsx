import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

interface ResumePDFProps {
  personalInfo: any;
  skills: any[];
  workExperience: any[];
  education: any[];
  languages: any[];
  hobbies: any[];
  profile: any;
  journeyContent?: any;
}

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-lightitalic-webfont.ttf', fontWeight: 300, fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-mediumitalic-webfont.ttf', fontWeight: 500, fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf', fontWeight: 700, fontStyle: 'italic' },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Roboto',
    fontSize: 11,
    color: '#333',
    backgroundColor: '#fff',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 1,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    border: '1px solid #3563cb',
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    color: '#3563cb',
    marginBottom: 14,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 0,
    marginBottom: 4,
  },
  contactItem: {
    fontSize: 9,
    color: '#555',
    marginRight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#3563cb',
    marginVertical: 6,
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row',
    marginTop: 10,
  },
  journeySection: {
    marginBottom: 10,
  },
  journeyText: {
    fontSize: 10,
    textAlign: 'justify',
    color: '#444',
    lineHeight: 1.4,
    marginBottom: 6,
  },
  leftColumn: {
    width: '28%',
    paddingRight: 10,
  },
  rightColumn: {
    flexGrow: 1,
    width: '72%',
    paddingLeft: 10,
    borderLeft: '1px solid #eee',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#3563cb',
    marginBottom: 5,
    borderBottom: '1px solid #eee',
    paddingBottom: 2,
  },
  skill: {
    fontSize: 10,
    marginBottom: 3,
  },
  language: {
    fontSize: 10,
    marginBottom: 3,
    flexDirection: 'row',
  },
  languageName: {
    fontWeight: 500,
    marginRight: 3,
  },
  languageLevel: {
    fontStyle: 'italic',
    color: '#666',
  },
  hobby: {
    fontSize: 10,
    marginBottom: 3,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  experienceDetails: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  companyName: {
    fontSize: 10,
    color: '#3563cb',
    marginBottom: 2,
  },
  rightDetails: {
    alignItems: 'flex-end',
  },
  period: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
    textAlign: 'right',
  },
  location: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
    textAlign: 'right',
  },
  description: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'justify',
    color: '#444',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  tag: {
    fontSize: 8,
    marginRight: 4,
    marginBottom: 3,
    color: '#3563cb',
  },
  tagDot: {
    fontSize: 8,
    marginHorizontal: 2,
    color: '#3563cb',
  },
  degreeTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  university: {
    fontSize: 10,
    color: '#3563cb',
    marginBottom: 2,
  },
  availableSection: {
    marginTop: 8,
  },
  availableTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 3,
  },
  availableItem: {
    fontSize: 9,
    marginBottom: 1,
  },
});

// Format dates helper
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Present';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// SVG profile placeholder as a data URL
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiMzNTYzY2IiLz48cGF0aCBkPSJNNDAsMjAgQzM0LjUsMjAgMzAsMjQuNSAzMCwzMCBDMzAsMzUuNSAzNC41LDQwIDQwLDQwIEM0NS41LDQwIDUwLDM1LjUgNTAsMzAgQzUwLDI0LjUgNDUuNSwyMCA0MCwyMCBaTTIwLDYwIEMyMCw1MCAzMCw0NSA0MCw0NSBDNTAsNDUgNjAsNTAgNjAsNjAgWiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=';

// Process journey content to handle line breaks
const processJourneyContent = (content: string) => {
  if (!content) return [];
  return content.split('\n\n').filter(p => p.trim() !== '');
};

const ResumePDF: React.FC<ResumePDFProps> = ({
  personalInfo,
  skills,
  workExperience,
  education,
  languages,
  hobbies,
  profile,
  journeyContent,
}) => {
  // Process journey content if available
  const journeyParagraphs = journeyContent?.content 
    ? processJourneyContent(journeyContent.content)
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            style={styles.profileImage} 
            src={profile?.avatar_url || PLACEHOLDER_IMAGE} 
          />
          <View style={styles.headerContent}>
            <Text style={styles.name}>{personalInfo?.full_name || 'Full Name'}</Text>
            
            {/* Contact Info */}
            <View style={styles.contactInfo}>
              {personalInfo?.email && <Text style={styles.contactItem}>Email: {personalInfo.email}</Text>}
              {personalInfo?.phone && <Text style={styles.contactItem}>Phone: {personalInfo.phone}</Text>}
              {personalInfo?.location && <Text style={styles.contactItem}>Location: {personalInfo.location}</Text>}
            </View>
          </View>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Journey content (without title) */}
        {journeyParagraphs.length > 0 && (
          <View style={styles.journeySection}>
            {journeyParagraphs.map((paragraph, index) => (
              <Text key={index} style={styles.journeyText}>
                {paragraph}
              </Text>
            ))}
          </View>
        )}
        
        {/* Content */}
        <View style={styles.content}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Skills Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skill}>
                  {skill.name}
                </Text>
              ))}
            </View>
            
            {/* Languages Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Languages</Text>
              {languages.map((lang) => (
                <View key={lang.id} style={styles.language}>
                  <Text style={styles.languageName}>
                    {lang.language} 
                    <Text style={styles.languageLevel}>
                      {lang.is_native ? ' (Native)' : ` (${lang.proficiency})`}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Interests Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              {hobbies.map((hobby) => (
                <Text key={hobby.id} style={styles.hobby}>
                  {hobby.name}
                </Text>
              ))}
            </View>
            
            {/* Available For Section */}
            {personalInfo?.available_for && personalInfo.available_for.length > 0 && (
              <View style={styles.availableSection}>
                <Text style={styles.availableTitle}>Available For:</Text>
                {personalInfo.available_for.map((item: string, index: number) => (
                  <Text key={index} style={styles.availableItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </View>
          
          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Work Experience Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              {workExperience.map((work) => (
                <View key={work.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View style={styles.experienceDetails}>
                      <Text style={styles.jobTitle}>{work.position || work.title}</Text>
                      <Text style={styles.companyName}>{work.company_name}</Text>
                    </View>
                    <View style={styles.rightDetails}>
                      <Text style={styles.period}>
                        {formatDate(work.start_date)} - {work.current ? 'Present' : formatDate(work.end_date)}
                      </Text>
                      {work.location && (
                        <Text style={styles.location}>{work.location}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.description}>{work.description}</Text>
                  
                  {work.tags && work.tags.length > 0 && (
                    <View style={styles.tags}>
                      {work.tags.slice(0, 3).map((tag: string, index: number) => (
                        <View key={index} style={{ flexDirection: 'row' }}>
                          <Text style={styles.tag}>{tag}</Text>
                          {index < Math.min(work.tags.length, 3) - 1 && (
                            <Text style={styles.tagDot}>•</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
            
            {/* Education Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {education.map((edu) => (
                <View key={edu.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View style={styles.experienceDetails}>
                      <Text style={styles.degreeTitle}>{edu.title}</Text>
                      <Text style={styles.university}>{edu.organization}</Text>
                    </View>
                    <View style={styles.rightDetails}>
                      <Text style={styles.period}>
                        {formatDate(edu.start_date)} - {edu.current ? 'Present' : formatDate(edu.end_date)}
                      </Text>
                      {edu.location && (
                        <Text style={styles.location}>{edu.location}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.description}>{edu.description}</Text>
                  
                  {edu.tags && edu.tags.length > 0 && (
                    <View style={styles.tags}>
                      {edu.tags.slice(0, 4).map((tag: string, index: number) => (
                        <View key={index} style={{ flexDirection: 'row' }}>
                          <Text style={styles.tag}>{tag}</Text>
                          {index < Math.min(edu.tags.length, 4) - 1 && (
                            <Text style={styles.tagDot}>•</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ResumePDF;