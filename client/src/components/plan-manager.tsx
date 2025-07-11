import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CheckCircle, Crown, Zap } from 'lucide-react';

interface PlanInfo {
  id: string;
  status: string;
  limits: {
    maxClasses: number;
    maxStudents: number;
    maxQuestionsPerMonth: number;
    maxGamesPerMonth: number;
    maxStorageMb: number;
    features: string[];
  };
  features: string[];
}

interface UsageInfo {
  questions: number;
  games: number;
  classes: number;
  students: number;
  storage: number;
}

interface PlanData {
  plan: PlanInfo;
  usage: UsageInfo;
  suggestions: string[];
  nextBillingDate: string | null;
  subscriptionId: string | null;
}

export function PlanManager() {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      // Get the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No session found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/plan', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlanData(data);
      } else {
        console.error('Failed to fetch plan data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (planId: string) => {
    setUpgrading(true);
    try {
      // Get the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/user/plan/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        toast({
          title: "Plan upgraded!",
          description: "Your plan has been successfully upgraded.",
        });
        fetchPlanData(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: "Upgrade failed",
          description: error.message || "Failed to upgrade plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade plan",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Zap className="h-4 w-4" />;
      case 'basic':
        return <CheckCircle className="h-4 w-4" />;
      case 'pro':
        return <Crown className="h-4 w-4" />;
      case 'enterprise':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0; // Unlimited
    return Math.min((current / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!planData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load plan information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const { plan, usage, suggestions } = planData;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(plan.id)}
                Current Plan: {plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}
              </CardTitle>
              <CardDescription>
                Status: <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                  {plan.status}
                </Badge>
              </CardDescription>
            </div>
            <Badge className={getPlanColor(plan.id)}>
              {plan.id.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Plan Features</h4>
              <ul className="space-y-1 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Plan Limits</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Classes:</span>
                  <span>{plan.limits.maxClasses === -1 ? 'Unlimited' : plan.limits.maxClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Students:</span>
                  <span>{plan.limits.maxStudents === -1 ? 'Unlimited' : plan.limits.maxStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions/month:</span>
                  <span>{plan.limits.maxQuestionsPerMonth === -1 ? 'Unlimited' : plan.limits.maxQuestionsPerMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Games/month:</span>
                  <span>{plan.limits.maxGamesPerMonth === -1 ? 'Unlimited' : plan.limits.maxGamesPerMonth}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>
            Your usage for this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Classes</span>
                <span>{usage.classes} / {plan.limits.maxClasses === -1 ? '∞' : plan.limits.maxClasses}</span>
              </div>
              <Progress value={calculateUsagePercentage(usage.classes, plan.limits.maxClasses)} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Students</span>
                <span>{usage.students} / {plan.limits.maxStudents === -1 ? '∞' : plan.limits.maxStudents}</span>
              </div>
              <Progress value={calculateUsagePercentage(usage.students, plan.limits.maxStudents)} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Questions (this month)</span>
                <span>{usage.questions} / {plan.limits.maxQuestionsPerMonth === -1 ? '∞' : plan.limits.maxQuestionsPerMonth}</span>
              </div>
              <Progress value={calculateUsagePercentage(usage.questions, plan.limits.maxQuestionsPerMonth)} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Games (this month)</span>
                <span>{usage.games} / {plan.limits.maxGamesPerMonth === -1 ? '∞' : plan.limits.maxGamesPerMonth}</span>
              </div>
              <Progress value={calculateUsagePercentage(usage.games, plan.limits.maxGamesPerMonth)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Suggestions</CardTitle>
            <CardDescription>
              Consider upgrading to unlock more features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  {suggestion}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Upgrade Options */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose a plan that fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['free', 'basic', 'pro', 'enterprise'].map((planId) => (
              <div key={planId} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon(planId)}
                  <span className="font-medium capitalize">{planId}</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {planId === 'free' && 'Perfect for getting started'}
                  {planId === 'basic' && 'Great for small classes'}
                  {planId === 'pro' && 'Ideal for active teachers'}
                  {planId === 'enterprise' && 'For schools and districts'}
                </div>
                {plan.id !== planId && (
                  <Button
                    size="sm"
                    onClick={() => upgradePlan(planId)}
                    disabled={upgrading}
                    className="w-full"
                  >
                    {upgrading ? 'Upgrading...' : plan.id === 'free' ? 'Upgrade' : 'Switch'}
                  </Button>
                )}
                {plan.id === planId && (
                  <Badge className="w-full justify-center" variant="secondary">
                    Current Plan
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 