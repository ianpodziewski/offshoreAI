"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, MessageSquare, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import LayoutWrapper from './layout-wrapper';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    unassigned: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch document sockets
        const socketsResponse = await fetch('/api/get-file-sockets');
        const socketsData = await socketsResponse.json();
        
        // Fetch document statuses
        const statusesResponse = await fetch('/api/document-status');
        const statusesData = await statusesResponse.json();
        
        // Calculate statistics
        const statuses = statusesData.statuses || {};
        const statusCounts = {
          totalDocuments: 0,
          reviewing: 0,
          approved: 0,
          rejected: 0,
          unassigned: 0,
        };
        
        // Count total documents from file sockets
        let totalDocsFromSockets = 0;
        Object.values(socketsData.files || {}).forEach((docs: any) => {
          totalDocsFromSockets += (docs as any[]).length;
        });
        
        // Count documents by status
        Object.values(statuses).forEach((status: any) => {
          const statusValue = status.status;
          if (statusValue === 'reviewing') statusCounts.reviewing++;
          else if (statusValue === 'approved') statusCounts.approved++;
          else if (statusValue === 'rejected') statusCounts.rejected++;
          else if (statusValue === 'assigned' || statusValue === 'unassigned') statusCounts.unassigned++;
        });
        
        // Set total documents
        statusCounts.totalDocuments = Math.max(
          totalDocsFromSockets,
          Object.keys(statuses).length
        );
        
        setStats(statusCounts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      href: '/documents'
    },
    {
      title: 'Under Review',
      value: stats.reviewing,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      href: '/documents'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      href: '/documents'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      href: '/documents'
    },
  ];
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-16 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Loan Document Management Dashboard</h1>
          <p className="text-gray-600">Review, manage, and track loan documents within your pipeline</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="shadow-sm bg-gray-50 animate-pulse">
                <CardContent className="p-6 h-24"></CardContent>
              </Card>
            ))
          ) : (
            statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link href={card.href} key={index}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{card.title}</p>
                          <p className="text-3xl font-bold mt-1">{card.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${card.bgColor}`}>
                          <Icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">Loan Document Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Link 
                  href="/upload" 
                  className="block p-3 border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 rounded-full bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Upload Document Package</h3>
                    <p className="text-sm text-gray-500">Split and categorize loan documents</p>
                  </div>
                </Link>
                
                <Link 
                  href="/documents" 
                  className="block p-3 border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 rounded-full bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Review Documents</h3>
                    <p className="text-sm text-gray-500">Update status and add notes to documents</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">AI Assistance</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Link 
                href="/chat" 
                className="block p-3 border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <div className="p-2 rounded-full bg-purple-50">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Chat with Loan Assistant</h3>
                  <p className="text-sm text-gray-500">Get help with document review and requirements</p>
                </div>
              </Link>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium text-sm mb-2">Ask the assistant about:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <span>Document requirements and verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <span>Regulatory guidelines and compliance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <span>Common errors in loan documentation</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}