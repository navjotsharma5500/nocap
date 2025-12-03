import { useState } from 'react';
import { Search, Shield, CheckCircle, XCircle, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { societyMembers } from '@/data/mockData';

type VerificationResult = 'allowed' | 'denied' | null;

export function GuardView() {
  const [rollNo, setRollNo] = useState('');
  const [result, setResult] = useState<VerificationResult>(null);
  const [student, setStudent] = useState<typeof societyMembers[0] | null>(null);

  const handleVerify = () => {
    const found = societyMembers.find(
      (s) => s.rollNo.toLowerCase() === rollNo.toLowerCase()
    );
    
    if (found) {
      setStudent(found);
      // Simulate that some students have permission
      setResult(found.id === '1' || found.id === '3' ? 'allowed' : 'denied');
    } else {
      setStudent(null);
      setResult('denied');
    }
  };

  const handleReset = () => {
    setRollNo('');
    setResult(null);
    setStudent(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md px-4 py-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-elevated">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Guard Verification</h1>
          <p className="text-muted-foreground">Manual student verification portal</p>
        </div>

        <Card className="p-6 animate-fade-in">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Student Roll Number
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 2021CS1234"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="flex-1"
              />
              <Button onClick={handleVerify} className="gap-2 gradient-primary">
                <Search className="h-4 w-4" />
                Verify
              </Button>
            </div>
          </div>

          {result && (
            <div className="animate-scale-in">
              <div
                className={`rounded-xl p-6 text-center ${
                  result === 'allowed'
                    ? 'bg-success/10 border-2 border-success'
                    : 'bg-destructive/10 border-2 border-destructive'
                }`}
              >
                {result === 'allowed' ? (
                  <>
                    <CheckCircle className="mx-auto mb-3 h-16 w-16 text-success" />
                    <h2 className="text-2xl font-bold text-success">ALLOWED</h2>
                    <p className="text-success/80">Permission verified</p>
                  </>
                ) : (
                  <>
                    <XCircle className="mx-auto mb-3 h-16 w-16 text-destructive" />
                    <h2 className="text-2xl font-bold text-destructive">DENIED</h2>
                    <p className="text-destructive/80">No active permission</p>
                  </>
                )}
              </div>

              {student && (
                <div className="mt-4 flex items-center gap-4 rounded-lg bg-muted p-4">
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.hostel} • {student.room}
                    </p>
                  </div>
                </div>
              )}

              {!student && result === 'denied' && (
                <div className="mt-4 flex items-center gap-4 rounded-lg bg-muted p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted-foreground/20">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Student Not Found</p>
                    <p className="text-sm text-muted-foreground">Roll number not in database</p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleReset}
                className="mt-4 w-full"
              >
                Verify Another Student
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            For QR-based verification, ask the student to show their Green Pass screen.
          </p>
        </div>
      </div>
    </div>
  );
}
