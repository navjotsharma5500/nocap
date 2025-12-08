"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Upload, User, QrCode, FileText, Users, LogOut } from "lucide-react";

export default function Home() {
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    year: "",
    branch: "",
    email: "",
    societies: [] as string[],
    proof: null as File | null,
  });

  const societiesList = [
    { id: "css", label: "CSS (Computer Science Society)" },
    { id: "urja", label: "URJA (Fest)" },
    { id: "mlsc", label: "MLSC (Microsoft Learn Student Club)" },
    { id: "echoes", label: "ECHOES (Music Society)" },
    { id: "econ", label: "ECON (Economics Society)" },
  ];

  const handleSocietyChange = (societyId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, societies: [...prev.societies, societyId] };
      } else {
        return { ...prev, societies: prev.societies.filter((id) => id !== societyId) };
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, proof: e.target.files[0] });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Registration:", formData);
    setView('dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setView('dashboard');
  };

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xl font-bold">CampusPass</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline">Welcome, {formData.name || "Student"}</span>
              <Button variant="secondary" size="sm" onClick={() => setView('login')}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Pass Card */}
            <Card className="md:col-span-1 border-t-4 border-t-green-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <QrCode className="w-5 h-5 mr-2" />
                  Active Pass
                </CardTitle>
                <CardDescription>You have an active night permission.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                  <p className="font-semibold text-green-800">Hackathon Prep</p>
                  <p className="text-sm text-green-600">Valid until 02:00 AM</p>
                </div>
                <Link href="/pass/1">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    View Digital Pass
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* New Request Card */}
            <Card className="md:col-span-1 border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <FileText className="w-5 h-5 mr-2" />
                  New Request
                </CardTitle>
                <CardDescription>Apply for night permission or venue.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Create Permission Request
                </Button>
                <Button className="w-full mt-2" variant="ghost">
                  Book Room / Venue
                </Button>
              </CardContent>
            </Card>

            {/* Society Status Card */}
            <Card className="md:col-span-1 border-t-4 border-t-purple-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Users className="w-5 h-5 mr-2" />
                  Society Memberships
                </CardTitle>
                <CardDescription>Status of your join requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formData.societies.length > 0 ? (
                    formData.societies.map(s => (
                      <div key={s} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                        <span className="font-medium uppercase">{s}</span>
                        <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs border border-yellow-200">Pending Approval</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                      <span className="font-medium">Tech Club</span>
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs border border-green-200">Member</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">Night Permission Request #{100 + i}</p>
                      <p className="text-sm text-muted-foreground">Submitted on Dec {8 - i}, 2025</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${i === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {i === 1 ? 'Pending President' : 'Approved'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl">Student Registration</CardTitle>
            <CardDescription>
              Enter your details to register for campus access and society memberships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name (as on ID Card)</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNo">Roll Number</Label>
                  <Input 
                    id="rollNo" 
                    placeholder="2023CS101" 
                    required 
                    value={formData.rollNo}
                    onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select onValueChange={(val) => setFormData({...formData, year: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select onValueChange={(val) => setFormData({...formData, branch: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                      <SelectItem value="ECE">Electronics (ECE)</SelectItem>
                      <SelectItem value="ME">Mechanical (ME)</SelectItem>
                      <SelectItem value="CE">Civil (CE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">University Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john.doe@university.edu" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base">Society Memberships</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-slate-50">
                  {societiesList.map((society) => (
                    <div key={society.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={society.id} 
                        onCheckedChange={(checked) => handleSocietyChange(society.id, checked as boolean)}
                      />
                      <Label htmlFor={society.id} className="font-normal cursor-pointer">
                        {society.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proof">Upload ID Card / Society Proof</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    id="proof" 
                    type="file" 
                    className="cursor-pointer" 
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  <Upload className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-xs text-muted-foreground">Upload a clear photo of your University ID or Society Acceptance Letter.</p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => setView('login')}>
                  Cancel
                </Button>
                <Button type="submit" className="w-full">
                  Submit Registration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">CampusPass</h1>
        <p className="text-slate-600">University Access & Permission System</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access the portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="student@university.edu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center border-t p-6 bg-slate-50 rounded-b-lg">
          <p className="text-sm text-slate-500">
            New student? <button onClick={() => setView('register')} className="text-primary font-semibold hover:underline">Register here</button>
          </p>
          <p className="text-xs text-muted-foreground">
            Faculty or Admin? <a href="#" className="underline">Login here</a>
          </p>
          <div className="pt-4 border-t w-full mt-4">
            <Link href="/guard/scan">
              <Button variant="outline" className="w-full text-xs">
                <ShieldCheck className="w-3 h-3 mr-2" />
                Guard Terminal Access
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
