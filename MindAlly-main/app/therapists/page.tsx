'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Video,
  MessageCircle,
  Heart,
  Shield,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  BookOpen,
  DollarSign,
  Languages,
  GraduationCap,
  Clock3,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';

interface Therapist {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  price: number;
  languages: string[];
  availability: string[];
  bio: string;
  education: string[];
  certifications: string[];
  avatar: string;
  verified: boolean;
  nextAvailable: Date;
  location: string;
  remote: boolean;
  inPerson: boolean;
}

interface Booking {
  id: string;
  therapistId: string;
  therapistName: string;
  date: Date;
  time: string;
  duration: number;
  type: 'video' | 'phone' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

const specializations = [
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
];

export default function TherapistsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [availability, setAvailability] = useState('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isTherapistModalOpen, setIsTherapistModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [newBooking, setNewBooking] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'video' as 'video' | 'phone' | 'in-person',
    notes: ''
  });
  const [isDemoMode, setIsDemoMode] = useState(true); // Always show demo data for public access

  useEffect(() => {
    fetchTherapists();
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterTherapists();
  }, [therapists, searchTerm, selectedSpecialization, priceRange, availability]);

  const fetchTherapists = async () => {
    try {
      // Always show demo data for public access
      const mockTherapists: Therapist[] = [
        {
          id: '1',
          name: 'Dr. Priya Sharma',
          title: 'Clinical Psychologist',
          specializations: ['Anxiety Disorders', 'Depression', 'Trauma & PTSD', 'Cultural Therapy'],
          experience: 12,
          rating: 4.9,
          reviewCount: 156,
          price: 2500,
          languages: ['English', 'Hindi', 'Punjabi'],
          availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          bio: 'Dr. Sharma specializes in treating anxiety and depression using evidence-based approaches including CBT and mindfulness techniques. She has extensive experience working with Indian families and cultural issues, helping clients navigate the unique challenges of modern Indian life.',
          education: ['PhD in Clinical Psychology, Delhi University', 'MA in Psychology, JNU', 'Post-Doc in Cultural Psychology, Harvard'],
          certifications: ['RCI Licensed Clinical Psychologist', 'CBT Certified', 'Mindfulness-Based Therapy', 'Cultural Competency Specialist'],
          avatar: '/avatars/priya.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-20'),
          location: 'Delhi, India',
          remote: true,
          inPerson: true
        },
        {
          id: '2',
          name: 'Dr. Rajesh Kumar',
          title: 'Marriage and Family Therapist',
          specializations: ['Relationship Issues', 'Couples Therapy', 'Family Therapy', 'Inter-generational Conflicts'],
          experience: 8,
          rating: 4.8,
          reviewCount: 98,
          price: 2000,
          languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
          availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
          bio: 'Dr. Kumar helps couples and families build stronger relationships through communication and understanding. He specializes in addressing cultural and generational conflicts in Indian families, including arranged marriage dynamics and joint family issues.',
          education: ['MA in Clinical Psychology, TISS Mumbai', 'BA in Psychology, Madras University', 'Certificate in Family Systems Therapy'],
          certifications: ['RCI Licensed Marriage and Family Therapist', 'Gottman Method Level 2', 'Family Systems Specialist'],
          avatar: '/avatars/rajesh.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-18'),
          location: 'Mumbai, India',
          remote: true,
          inPerson: false
        },
        {
          id: '3',
          name: 'Dr. Anjali Mehta',
          title: 'Clinical Social Worker',
          specializations: ['Trauma & PTSD', 'Grief & Loss', 'Women\'s Issues', 'Domestic Violence'],
          experience: 15,
          rating: 4.9,
          reviewCount: 203,
          price: 2200,
          languages: ['English', 'Hindi', 'Gujarati', 'Marathi'],
          availability: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          bio: 'Dr. Mehta has extensive experience working with trauma survivors and women facing domestic violence. She provides culturally sensitive therapy for Indian women, addressing issues like dowry harassment, workplace discrimination, and family pressure.',
          education: ['PhD in Social Work, TISS Mumbai', 'MSW, Delhi University', 'Certificate in Trauma-Informed Care'],
          certifications: ['RCI Licensed Clinical Social Worker', 'Trauma-Informed Care Certified', 'Women\'s Mental Health Specialist'],
          avatar: '/avatars/anjali.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-22'),
          location: 'Bangalore, India',
          remote: true,
          inPerson: true
        },
        {
          id: '4',
          name: 'Dr. Vikram Singh',
          title: 'Addiction Counselor',
          specializations: ['Addiction', 'Depression', 'Anger Management', 'Substance Abuse'],
          experience: 10,
          rating: 4.7,
          reviewCount: 87,
          price: 1800,
          languages: ['English', 'Hindi', 'Punjabi'],
          availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
          bio: 'Dr. Singh specializes in addiction recovery and helping individuals manage depression and anger. He works with both traditional and modern therapeutic approaches, including yoga and meditation for recovery.',
          education: ['PhD in Counseling Psychology, Punjab University', 'MA in Clinical Psychology, Chandigarh', 'Certificate in Addiction Counseling'],
          certifications: ['RCI Licensed Professional Counselor', 'Addiction Counselor Certified', 'Anger Management Specialist'],
          avatar: '/avatars/vikram.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-19'),
          location: 'Chandigarh, India',
          remote: true,
          inPerson: true
        },
        {
          id: '5',
          name: 'Dr. Sushma Reddy',
          title: 'Mental Health Counselor',
          specializations: ['Eating Disorders', 'Body Image', 'Self-Esteem', 'Body Dysmorphia'],
          experience: 6,
          rating: 4.8,
          reviewCount: 64,
          price: 1600,
          languages: ['English', 'Hindi', 'Telugu', 'Tamil'],
          availability: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
          bio: 'Dr. Reddy helps individuals develop healthy relationships with food and their bodies. She specializes in addressing body image issues in Indian cultural context, including fair skin obsession and weight stigma.',
          education: ['MA in Mental Health Counseling, Osmania University', 'BA in Psychology, Hyderabad University', 'Certificate in Eating Disorder Treatment'],
          certifications: ['RCI Licensed Mental Health Counselor', 'Eating Disorder Specialist', 'Body Image Therapy Certified'],
          avatar: '/avatars/sushma.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-21'),
          location: 'Hyderabad, India',
          remote: true,
          inPerson: false
        },
        {
          id: '6',
          name: 'Dr. Arjun Patel',
          title: 'Child & Adolescent Psychologist',
          specializations: ['Child & Adolescent', 'ADHD', 'Autism Spectrum', 'Academic Pressure'],
          experience: 9,
          rating: 4.6,
          reviewCount: 72,
          price: 1900,
          languages: ['English', 'Hindi', 'Gujarati'],
          availability: ['Monday', 'Tuesday', 'Wednesday', 'Saturday'],
          bio: 'Dr. Patel specializes in working with children and adolescents, helping them navigate academic pressure and family expectations common in Indian society, including competitive exam stress and career guidance.',
          education: ['PhD in Child Psychology, Gujarat University', 'MA in Psychology, Ahmedabad University', 'Certificate in ADHD Assessment'],
          certifications: ['RCI Licensed Child Psychologist', 'ADHD Specialist', 'Autism Assessment Certified', 'Academic Counseling'],
          avatar: '/avatars/arjun.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-23'),
          location: 'Ahmedabad, India',
          remote: true,
          inPerson: true
        },
        {
          id: '7',
          name: 'Dr. Meera Iyer',
          title: 'Geriatric Psychologist',
          specializations: ['Elderly Care', 'Dementia', 'Loneliness', 'Age-related Depression'],
          experience: 11,
          rating: 4.7,
          reviewCount: 89,
          price: 1700,
          languages: ['English', 'Hindi', 'Tamil', 'Malayalam'],
          availability: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
          bio: 'Dr. Iyer specializes in mental health care for elderly individuals, addressing issues like loneliness, dementia, and the challenges of aging in Indian families. She helps families understand and support their aging parents.',
          education: ['PhD in Geriatric Psychology, Chennai University', 'MA in Clinical Psychology, Anna University', 'Certificate in Dementia Care'],
          certifications: ['RCI Licensed Clinical Psychologist', 'Geriatric Mental Health Specialist', 'Dementia Care Certified'],
          avatar: '/avatars/meera.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-24'),
          location: 'Chennai, India',
          remote: true,
          inPerson: true
        },
        {
          id: '8',
          name: 'Dr. Rahul Verma',
          title: 'Career & Life Coach',
          specializations: ['Career Counseling', 'Life Transitions', 'Work Stress', 'Mid-life Crisis'],
          experience: 7,
          rating: 4.5,
          reviewCount: 56,
          price: 1500,
          languages: ['English', 'Hindi', 'Bengali'],
          availability: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
          bio: 'Dr. Verma helps professionals navigate career transitions, work stress, and life changes. He specializes in addressing the unique challenges faced by Indian professionals, including job market anxiety and work-life balance.',
          education: ['MA in Counseling Psychology, Calcutta University', 'MBA in Human Resources, IIM Calcutta', 'Certificate in Career Counseling'],
          certifications: ['RCI Licensed Professional Counselor', 'Career Development Specialist', 'Life Coaching Certified'],
          avatar: '/avatars/rahul.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-25'),
          location: 'Kolkata, India',
          remote: true,
          inPerson: false
        },
        {
          id: '9',
          name: 'Dr. Kavita Joshi',
          title: 'LGBTQ+ Affirmative Therapist',
          specializations: ['LGBTQ+ Issues', 'Gender Identity', 'Coming Out', 'Family Acceptance'],
          experience: 5,
          rating: 4.8,
          reviewCount: 43,
          price: 1800,
          languages: ['English', 'Hindi', 'Marathi'],
          availability: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
          bio: 'Dr. Joshi provides safe, affirming therapy for LGBTQ+ individuals and their families. She helps clients navigate coming out, family acceptance, and the unique challenges of being LGBTQ+ in Indian society.',
          education: ['MA in Clinical Psychology, Pune University', 'Certificate in LGBTQ+ Affirmative Therapy', 'Gender Studies Certificate'],
          certifications: ['RCI Licensed Clinical Psychologist', 'LGBTQ+ Affirmative Therapy Certified', 'Gender Identity Specialist'],
          avatar: '/avatars/kavita.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-26'),
          location: 'Pune, India',
          remote: true,
          inPerson: true
        },
        {
          id: '10',
          name: 'Dr. Amit Desai',
          title: 'Sports Psychologist',
          specializations: ['Sports Psychology', 'Performance Anxiety', 'Injury Recovery', 'Mental Training'],
          experience: 8,
          rating: 4.6,
          reviewCount: 67,
          price: 2000,
          languages: ['English', 'Hindi', 'Gujarati'],
          availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
          bio: 'Dr. Desai works with athletes and sports professionals to improve mental performance, handle pressure, and recover from injuries. He has experience working with cricket, badminton, and other popular Indian sports.',
          education: ['PhD in Sports Psychology, Gujarat University', 'MA in Psychology, Ahmedabad University', 'Certificate in Sports Mental Health'],
          certifications: ['RCI Licensed Clinical Psychologist', 'Sports Psychology Specialist', 'Performance Enhancement Certified'],
          avatar: '/avatars/amit.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-27'),
          location: 'Gandhinagar, India',
          remote: true,
          inPerson: true
        },
        {
          id: '11',
          name: 'Dr. Sunita Agarwal',
          title: 'Prenatal & Postnatal Mental Health Specialist',
          specializations: ['Prenatal Depression', 'Postpartum Depression', 'Pregnancy Anxiety', 'Parenting Stress'],
          experience: 9,
          rating: 4.9,
          reviewCount: 112,
          price: 2100,
          languages: ['English', 'Hindi', 'Rajasthani'],
          availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
          bio: 'Dr. Agarwal specializes in supporting women through pregnancy and early motherhood. She addresses prenatal anxiety, postpartum depression, and the unique challenges of motherhood in Indian families.',
          education: ['PhD in Clinical Psychology, Rajasthan University', 'MA in Psychology, Jaipur University', 'Certificate in Perinatal Mental Health'],
          certifications: ['RCI Licensed Clinical Psychologist', 'Perinatal Mental Health Specialist', 'Postpartum Depression Certified'],
          avatar: '/avatars/sunita.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-28'),
          location: 'Jaipur, India',
          remote: true,
          inPerson: true
        },
        {
          id: '12',
          name: 'Dr. Ravi Nair',
          title: 'Mindfulness & Meditation Therapist',
          specializations: ['Mindfulness', 'Meditation', 'Stress Reduction', 'Spiritual Counseling'],
          experience: 13,
          rating: 4.8,
          reviewCount: 134,
          price: 1900,
          languages: ['English', 'Hindi', 'Malayalam', 'Sanskrit'],
          availability: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
          bio: 'Dr. Nair combines traditional Indian meditation practices with modern psychology to help clients find inner peace and balance. He teaches Vipassana, Yoga Nidra, and other ancient techniques adapted for modern life.',
          education: ['PhD in Psychology, Kerala University', 'MA in Clinical Psychology, Calicut University', 'Vipassana Teacher Certification'],
          certifications: ['RCI Licensed Clinical Psychologist', 'Mindfulness-Based Therapy Certified', 'Meditation Teacher', 'Spiritual Counseling'],
          avatar: '/avatars/ravi.jpg',
          verified: true,
          nextAvailable: new Date('2024-01-29'),
          location: 'Kochi, India',
          remote: true,
          inPerson: true
        }
      ];
      setTherapists(mockTherapists);
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
      toast.error('Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockBookings: Booking[] = [
        {
          id: '1',
          therapistId: '1',
          therapistName: 'Dr. Priya Sharma',
          date: new Date('2024-01-25'),
          time: '10:00 AM',
          duration: 60,
          type: 'video',
          status: 'upcoming',
          notes: 'First session - anxiety management'
        },
        {
          id: '2',
          therapistId: '2',
          therapistName: 'Dr. Rajesh Kumar',
          date: new Date('2024-01-15'),
          time: '2:00 PM',
          duration: 60,
          type: 'phone',
          status: 'completed',
          notes: 'Couples counseling session'
        }
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const filterTherapists = () => {
    let filtered = therapists;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(therapist =>
        therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        therapist.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter(therapist =>
        therapist.specializations.includes(selectedSpecialization)
      );
    }

    // Filter by price range
    filtered = filtered.filter(therapist =>
      therapist.price >= priceRange[0] && therapist.price <= priceRange[1]
    );

    // Filter by availability
    if (availability === 'remote') {
      filtered = filtered.filter(therapist => therapist.remote);
    } else if (availability === 'in-person') {
      filtered = filtered.filter(therapist => therapist.inPerson);
    }

    setFilteredTherapists(filtered);
  };

  const handleBookSession = (therapist: Therapist) => {
    if (!user) {
      toast.success('This is a demo! In a real app, you would sign in to book a session with ' + therapist.name);
      return;
    }
    setSelectedTherapist(therapist);
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = async () => {
    if (!selectedTherapist || !newBooking.date || !newBooking.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const booking: Booking = {
        id: Date.now().toString(),
        therapistId: selectedTherapist.id,
        therapistName: selectedTherapist.name,
        date: new Date(newBooking.date),
        time: newBooking.time,
        duration: newBooking.duration,
        type: newBooking.type,
        status: 'upcoming',
        notes: newBooking.notes
      };

      setBookings([booking, ...bookings]);
      setNewBooking({
        date: '',
        time: '',
        duration: 60,
        type: 'video',
        notes: ''
      });
      setIsBookingModalOpen(false);
      toast.success('Session booked successfully!');
    } catch (error) {
      console.error('Failed to create booking:', error);
      toast.error('Failed to book session');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ));
      toast.success('Booking cancelled');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Stethoscope className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Demo Mode - Browse 12+ Indian Therapists</h3>
                <p className="text-sm text-blue-700">Explore our diverse network of licensed mental health professionals from across India. Specializations include cultural therapy, LGBTQ+ support, sports psychology, and more!</p>
              </div>
            </div>
            <div className="text-sm text-blue-600 font-medium">
              Demo Account: demo@mindapp.in
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Stethoscope className="h-10 w-10 mr-3 text-primary-600" />
              Find Your Therapist
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with licensed mental health professionals who can help you on your wellness journey
            </p>
          </div>
        </div>

        <Tabs defaultValue="therapists" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="therapists">Browse Therapists</TabsTrigger>
            <TabsTrigger value="bookings">My Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="therapists">
            {/* Filters */}
            <div className="mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="label">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search therapists..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Specialization</label>
                      <select
                        value={selectedSpecialization}
                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">All Specializations</option>
                        {specializations.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Price Range</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-20"
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 3000])}
                          className="w-20"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ₹{priceRange[0]} - ₹{priceRange[1]} per hour
                      </div>
                    </div>
                    <div>
                      <label className="label">Availability</label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">All Types</option>
                        <option value="remote">Remote Only</option>
                        <option value="in-person">In-Person Only</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Therapists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTherapists.map((therapist) => (
                <Card key={therapist.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{therapist.name}</CardTitle>
                          <CardDescription>{therapist.title}</CardDescription>
                        </div>
                      </div>
                      {therapist.verified && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {therapist.rating} ({therapist.reviewCount} reviews)
                      </div>
                      <div className="flex items-center">
                        <Clock3 className="h-4 w-4 mr-1" />
                        {therapist.experience} years
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-1">
                          {therapist.specializations.slice(0, 3).map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {therapist.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{therapist.specializations.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            ₹{therapist.price}/hr
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {therapist.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {therapist.remote && (
                          <Badge variant="secondary" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Remote
                          </Badge>
                        )}
                        {therapist.inPerson && (
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            In-Person
                          </Badge>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTherapist(therapist);
                            setIsTherapistModalOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleBookSession(therapist)}
                          className="flex-1"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTherapists.length === 0 && (
              <div className="text-center py-12">
                <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {!user ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Demo Mode - No Sign In Required</h3>
                <p className="text-gray-500 mb-6">
                  This is a demo! You can browse therapists without signing in. In a real app, you would sign in to see your therapy sessions.
                </p>
                <div className="text-sm text-gray-400">
                  Demo Account: demo@mindapp.in / demo123
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {bookings.filter(b => b.status === 'upcoming').length}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {bookings.filter(b => b.status === 'completed').length}
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                          <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{booking.therapistName}</h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(booking.date)} at {booking.time}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {booking.type === 'video' ? 'Video Call' : 
                                   booking.type === 'phone' ? 'Phone Call' : 'In-Person'}
                                </Badge>
                                <Badge 
                                  variant={booking.status === 'upcoming' ? 'default' : 
                                         booking.status === 'completed' ? 'secondary' : 'destructive'}
                                  className="text-xs"
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {booking.status === 'upcoming' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {bookings.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions booked</h3>
                      <p className="text-gray-500 mb-6">
                        Book your first therapy session to get started
                      </p>
                      <Button onClick={() => window.location.href = '#therapists'}>
                        Browse Therapists
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title={`Book Session with ${selectedTherapist?.name}`}
          description="Schedule your therapy session"
          size="md"
        >
          {selectedTherapist && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Session Details</h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Duration: {newBooking.duration} minutes</span>
                      <span>Price: ₹{selectedTherapist.price}/hour</span>
                    </div>
              </div>

              <div>
                <label className="label">Date</label>
                <Input
                  type="date"
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="label">Time</label>
                <Input
                  type="time"
                  value={newBooking.time}
                  onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Session Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'video', label: 'Video Call', icon: Video },
                    { value: 'phone', label: 'Phone Call', icon: Phone },
                    { value: 'in-person', label: 'In-Person', icon: MapPin }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewBooking({ ...newBooking, type: type.value as any })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        newBooking.type === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  placeholder="Any specific topics or concerns you'd like to discuss..."
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBooking}>
                  Book Session
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Therapist Profile Modal */}
        <Modal
          isOpen={isTherapistModalOpen}
          onClose={() => setIsTherapistModalOpen(false)}
          title={selectedTherapist?.name || ''}
          description={selectedTherapist?.title || ''}
          size="lg"
        >
          {selectedTherapist && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{selectedTherapist.name}</h3>
                    {selectedTherapist.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{selectedTherapist.title}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {selectedTherapist.rating} ({selectedTherapist.reviewCount} reviews)
                    </div>
                    <div className="flex items-center">
                      <Clock3 className="h-4 w-4 mr-1" />
                      {selectedTherapist.experience} years experience
                    </div>
                    <div className="flex items-center">
                      ₹{selectedTherapist.price}/hour
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">About</h4>
                <p className="text-gray-700 leading-relaxed">{selectedTherapist.bio}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTherapist.specializations.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Education</h4>
                <ul className="space-y-1">
                  {selectedTherapist.education.map((edu, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <GraduationCap className="h-4 w-4 text-primary-500 mr-2 mt-0.5" />
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
                <ul className="space-y-1">
                  {selectedTherapist.certifications.map((cert, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <Award className="h-4 w-4 text-primary-500 mr-2 mt-0.5" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTherapist.languages.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      <Languages className="h-3 w-3 mr-1" />
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTherapist.availability.map((day) => (
                    <Badge key={day} variant="outline">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsTherapistModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsTherapistModalOpen(false);
                  handleBookSession(selectedTherapist);
                }}>
                  Book Session
                </Button>
              </div>
            </div>
          )}
        </Modal>
        </div>
      </div>
    </>
  );
}

