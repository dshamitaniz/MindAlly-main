'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Stethoscope, 
  User, 
  Mail, 
  Lock, 
  Phone,
  MapPin,
  GraduationCap,
  Award,
  FileText,
  CheckCircle,
  Upload,
  Calendar,
  DollarSign,
  Languages,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  Brain,
  Heart,
  Target,
  Users,
  MessageCircle,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

// Move large arrays outside component to prevent recreation on renders
const THERAPY_SPECIALIZATIONS = [
  'Anxiety Disorders',
  'Depression',
  'Trauma & PTSD',
  'Cultural Therapy',
  'Relationship Issues',
  'Couples Therapy',
  'Family Therapy',
  'Inter-generational Conflicts',
  'Women\'s Issues',
  'Domestic Violence',
  'Addiction',
  'Substance Abuse',
  'Eating Disorders',
  'Body Image',
  'Body Dysmorphia',
  'Self-Esteem',
  'Child & Adolescent',
  'Academic Pressure',
  'ADHD',
  'Autism Spectrum',
  'Elderly Care',
  'Dementia',
  'Loneliness',
  'Age-related Depression',
  'Career Counseling',
  'Life Transitions',
  'Work Stress',
  'Mid-life Crisis',
  'LGBTQ+ Issues',
  'Gender Identity',
  'Coming Out',
  'Family Acceptance',
  'Sports Psychology',
  'Performance Anxiety',
  'Injury Recovery',
  'Mental Training',
  'Prenatal Depression',
  'Postpartum Depression',
  'Pregnancy Anxiety',
  'Parenting Stress',
  'Mindfulness',
  'Meditation',
  'Stress Reduction',
  'Spiritual Counseling',
  'Bipolar Disorder',
  'OCD',
  'Grief & Loss',
  'Anger Management',
  'Sleep Disorders'
] as const;

const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Urdu',
  'Kannada',
  'Odia',
  'Malayalam',
  'Punjabi',
  'Assamese',
  'Nepali',
  'Sanskrit',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Portuguese',
  'Other'
] as const;

export default function TherapistRegisterPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    
    // Professional Information
    title: '',
    licenseNumber: '',
    experience: '',
    specializations: [] as string[],
    languages: [] as string[],
    bio: '',
    education: '',
    certifications: '',
    
    // Practice Information
    hourlyRate: '',
    availability: [] as string[],
    remote: false,
    inPerson: false,
    address: '',
    
    // Verification
    licenseFile: null as File | null,
    degreeFile: null as File | null,
    idFile: null as File | null,
    
    // Terms
    termsAccepted: false,
    privacyAccepted: false
  });

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSpecializationToggle = useCallback((spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  }, []);

  const handleLanguageToggle = useCallback((lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  }, []);

  const handleAvailabilityToggle = useCallback((day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  }, []);

  const handleFileUpload = useCallback((field: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Login successful!');
      // Redirect to therapist dashboard
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (!formData.termsAccepted || !formData.privacyAccepted) {
        toast.error('Please accept the terms and privacy policy');
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Registration submitted! We\'ll review your application and get back to you within 24-48 hours.');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',
        title: '',
        licenseNumber: '',
        experience: '',
        specializations: [],
        languages: [],
        bio: '',
        education: '',
        certifications: '',
        hourlyRate: '',
        availability: [],
        remote: false,
        inPerson: false,
        address: '',
        licenseFile: null,
        degreeFile: null,
        idFile: null,
        termsAccepted: false,
        privacyAccepted: false
      });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Stethoscope className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Join Our Network</h3>
                <p className="text-sm text-purple-700">Register as a mental health professional to start connecting with clients.</p>
              </div>
            </div>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              Learn More
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Stethoscope className="h-12 w-12 text-primary-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Join Our Therapist Network</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with clients who need your expertise and help make mental health care more accessible
          </p>
        </div>

        <Tabs value={isLogin ? "login" : "register"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login" onClick={() => setIsLogin(true)}>Sign In</TabsTrigger>
            <TabsTrigger value="register" onClick={() => setIsLogin(false)}>Join as Therapist</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Sign in to your therapist account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" loading={loading}>
                    Sign In
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                    Forgot your password?
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Become a Therapist</CardTitle>
                <CardDescription className="text-center">
                  Join our network of licensed mental health professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">First Name</label>
                        <Input
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Last Name</label>
                        <Input
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Email</label>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Phone</label>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Location</label>
                        <Input
                          placeholder="City, State/Country"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Password</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="label">Confirm Password</label>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-primary-600" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Professional Title</label>
                        <Input
                          placeholder="e.g., Licensed Clinical Psychologist"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">License Number</label>
                        <Input
                          placeholder="Enter your license number"
                          value={formData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Years of Experience</label>
                        <Input
                          type="number"
                          placeholder="Enter years of experience"
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Hourly Rate (INR)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="number"
                            placeholder="Enter your hourly rate"
                            value={formData.hourlyRate}
                            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="label">Bio</label>
                      <Textarea
                        placeholder="Tell us about your background, approach, and what makes you unique as a therapist..."
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <label className="label">Education</label>
                      <Textarea
                        placeholder="List your educational background (degrees, institutions, years)"
                        value={formData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <label className="label">Certifications</label>
                      <Textarea
                        placeholder="List your professional certifications and training"
                        value={formData.certifications}
                        onChange={(e) => handleInputChange('certifications', e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-primary-600" />
                      Specializations
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Select all areas where you have expertise</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {THERAPY_SPECIALIZATIONS.map((spec) => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => handleSpecializationToggle(spec)}
                          className={`p-2 rounded-lg border-2 text-sm transition-all duration-200 ${
                            formData.specializations.includes(spec)
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Languages className="h-5 w-5 mr-2 text-primary-600" />
                      Languages
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Select all languages you can provide therapy in</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageToggle(lang)}
                          className={`p-2 rounded-lg border-2 text-sm transition-all duration-200 ${
                            formData.languages.includes(lang)
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                      Availability
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="label">Days Available</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleAvailabilityToggle(day)}
                              className={`p-2 rounded-lg border-2 text-sm transition-all duration-200 ${
                                formData.availability.includes(day)
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="label">Session Types</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.remote}
                              onChange={(e) => handleInputChange('remote', e.target.checked)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Remote (Video/Phone)</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.inPerson}
                              onChange={(e) => handleInputChange('inPerson', e.target.checked)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">In-Person</span>
                          </label>
                        </div>
                      </div>

                      {formData.inPerson && (
                        <div>
                          <label className="label">Office Address</label>
                          <Input
                            placeholder="Enter your office address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Documents */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary-600" />
                      Verification Documents
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Upload required documents for verification</p>
                    <div className="space-y-4">
                      <div>
                        <label className="label">Professional License</label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files && handleFileUpload('licenseFile', e.target.files[0])}
                            className="flex-1"
                          />
                          <Upload className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Degree Certificate</label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files && handleFileUpload('degreeFile', e.target.files[0])}
                            className="flex-1"
                          />
                          <Upload className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Government ID</label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files && handleFileUpload('idFile', e.target.files[0])}
                            className="flex-1"
                          />
                          <Upload className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.termsAccepted}
                          onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          I agree to the <Link href="/terms" className="text-primary-600 hover:text-primary-700">Terms of Service</Link> and understand that my application will be reviewed before approval.
                        </span>
                      </label>
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.privacyAccepted}
                          onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          I agree to the <Link href="/privacy" className="text-primary-600 hover:text-primary-700">Privacy Policy</Link> and consent to the processing of my personal data.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setIsLogin(true)}>
                      Already have an account? Sign In
                    </Button>
                    <Button type="submit" loading={loading} className="min-w-[120px]">
                      {loading ? 'Submitting...' : 'Submit Application'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Benefits Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Join Our Network?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Reach More Clients</h3>
                <p className="text-sm text-gray-600">
                  Connect with clients actively seeking mental health support in your area of expertise.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
                <p className="text-sm text-gray-600">
                  Set your own availability and work with clients on your schedule, whether remote or in-person.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure Platform</h3>
                <p className="text-sm text-gray-600">
                  HIPAA-compliant platform with secure video calls, messaging, and payment processing.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Competitive Rates</h3>
                <p className="text-sm text-gray-600">
                  Set your own rates and receive payments directly through our secure platform.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Client Communication</h3>
                <p className="text-sm text-gray-600">
                  Built-in messaging system for secure communication with your clients between sessions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Professional Growth</h3>
                <p className="text-sm text-gray-600">
                  Access to continuing education resources and professional development opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
