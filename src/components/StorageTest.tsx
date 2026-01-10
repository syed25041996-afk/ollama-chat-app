import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { storage } from '@/lib/storage';

export const StorageTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const testStorageQuota = async () => {
    addTestResult('Testing storage quota handling...');
    
    try {
      // Get current storage info
      const info = storage.getStorageInfo();
      addTestResult(`Current storage usage: ${info.used} bytes (${info.percentage}%)`);
      
      // Test creating a large conversation to potentially trigger quota exceeded
      const largeConversation = {
        id: 'test-conversation',
        title: 'Test Conversation',
        model: 'llama2',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // Add many messages to simulate large conversation
      for (let i = 0; i < 200; i++) {
        largeConversation.messages.push({
          role: 'user',
          content: `This is a very long message to simulate a large conversation. Message number ${i}. `.repeat(50),
        });
        largeConversation.messages.push({
          role: 'assistant',
          content: `This is the assistant response to message number ${i}. `.repeat(50),
        });
      }
      
      addTestResult('Attempting to save large conversation...');
      const saved = storage.addConversation(largeConversation);
      
      if (saved) {
        addTestResult('✅ Large conversation saved successfully');
        
        // Test truncation
        const conversations = storage.getConversations();
        const testConv = conversations.find(c => c.id === 'test-conversation');
        if (testConv) {
          addTestResult(`Conversation truncated to ${testConv.messages.length} messages (max: 100 per conversation)`);
        }
      } else {
        addTestResult('❌ Failed to save large conversation (quota exceeded handled gracefully)');
      }
      
      // Test clearing conversations
      addTestResult('Testing conversation cleanup...');
      const cleared = storage.clearConversations();
      if (cleared) {
        addTestResult('✅ Conversations cleared successfully');
      } else {
        addTestResult('❌ Failed to clear conversations');
      }
      
    } catch (error) {
      addTestResult(`❌ Test failed with error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Storage Quota Test</CardTitle>
          <CardDescription>
            Test the localStorage quota exceeded error handling and conversation size management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={testStorageQuota} variant="default" className="flex-1">
              Run Storage Test
            </Button>
            <Button onClick={clearResults} variant="outline" className="flex-1">
              Clear Results
            </Button>
          </div>
          
          {testResults.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-md max-h-96 overflow-auto">
              <h4 className="font-semibold mb-2">Test Results:</h4>
              <div className="space-y-1 text-sm font-mono">
                {testResults.map((result, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};