import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, FileText, Shield } from "lucide-react";

interface LegalModalProps {
  type: "terms" | "privacy";
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalModal({ type, isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;

  const content = {
    terms: {
      title: "Terms of Service",
      icon: <FileText className="w-6 h-6" />,
      content: `
        <h3 className="text-lg font-semibold mb-4">TeacherTools Terms of Service</h3>
        
        <p className="mb-4">Welcome to TeacherTools. By using our service, you agree to these terms.</p>
        
        <h4 className="font-semibold mb-2">1. Service Description</h4>
        <p className="mb-4">TeacherTools provides educational technology tools for teachers, including attendance tracking, game creation, and AI-powered content generation.</p>
        
        <h4 className="font-semibold mb-2">2. User Responsibilities</h4>
        <p className="mb-4">You are responsible for maintaining the security of your account and for all activities that occur under your account.</p>
        
        <h4 className="font-semibold mb-2">3. Privacy</h4>
        <p className="mb-4">We are committed to protecting your privacy. Please review our Privacy Policy for details on how we collect and use your information.</p>
        
        <h4 className="font-semibold mb-2">4. Data Protection</h4>
        <p className="mb-4">We implement appropriate security measures to protect your data and comply with applicable data protection laws.</p>
        
        <h4 className="font-semibold mb-2">5. Service Availability</h4>
        <p className="mb-4">We strive to maintain high service availability but cannot guarantee uninterrupted access to the service.</p>
        
        <h4 className="font-semibold mb-2">6. Changes to Terms</h4>
        <p className="mb-4">We may update these terms from time to time. We will notify you of any material changes.</p>
        
        <p className="text-sm text-gray-600 mt-6">Last updated: December 2024</p>
      `
    },
    privacy: {
      title: "Privacy Policy",
      icon: <Shield className="w-6 h-6" />,
      content: `
        <h3 className="text-lg font-semibold mb-4">TeacherTools Privacy Policy</h3>
        
        <p className="mb-4">Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
        
        <h4 className="font-semibold mb-2">1. Information We Collect</h4>
        <p className="mb-4">We collect information you provide directly to us, such as your name, email address, school information, and classroom data.</p>
        
        <h4 className="font-semibold mb-2">2. How We Use Your Information</h4>
        <p className="mb-4">We use your information to provide our services, improve our platform, and communicate with you about your account.</p>
        
        <h4 className="font-semibold mb-2">3. Data Security</h4>
        <p className="mb-4">We implement industry-standard security measures to protect your personal information and classroom data.</p>
        
        <h4 className="font-semibold mb-2">4. Data Sharing</h4>
        <p className="mb-4">We do not sell your personal information. We may share data only with your consent or as required by law.</p>
        
        <h4 className="font-semibold mb-2">5. Student Data Protection</h4>
        <p className="mb-4">We are committed to protecting student privacy and comply with applicable educational privacy laws.</p>
        
        <h4 className="font-semibold mb-2">6. Your Rights</h4>
        <p className="mb-4">You have the right to access, update, or delete your personal information at any time.</p>
        
        <h4 className="font-semibold mb-2">7. Contact Us</h4>
        <p className="mb-4">If you have questions about this privacy policy, please contact us at privacy@teachertools.com</p>
        
        <p className="text-sm text-gray-600 mt-6">Last updated: December 2024</p>
      `
    }
  };

  const currentContent = content[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              {currentContent.icon}
            </div>
            <div>
              <CardTitle>{currentContent.title}</CardTitle>
              <CardDescription>
                Please review our {type === "terms" ? "terms of service" : "privacy policy"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: currentContent.content }}
          />
        </CardContent>
        
        <div className="p-6 border-t">
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>
        </div>
      </Card>
    </div>
  );
} 