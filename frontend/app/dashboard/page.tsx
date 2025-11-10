'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { faqAPI, healthAPI, type FAQ, type AskResponse } from './lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);  // eslint-disable-line @typescript-eslint/no-explicit-any
  
  // Ask functionality
  const [askQuery, setAskQuery] = useState('');
  const [askResult, setAskResult] = useState<AskResponse | null>(null);
  const [askLoading, setAskLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    tags: '',
    lang: 'en',
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    fetchFaqs();
    checkHealth();
  }, [router]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await faqAPI.getAll();
      setFaqs(data);
    } catch (err) {
      setError('Failed to fetch FAQs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const health = await healthAPI.check();
      setHealthStatus(health);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      if (editingFaq) {
        await faqAPI.update(editingFaq.id, {
          question: formData.question,
          answer: formData.answer,
          tags,
          lang: formData.lang,
        });
      } else {
        await faqAPI.create({
          question: formData.question,
          answer: formData.answer,
          tags,
          lang: formData.lang,
        });
      }
      
      setFormData({ question: '', answer: '', tags: '', lang: 'en' });
      setShowAddForm(false);
      setEditingFaq(null);
      fetchFaqs();
    } catch (err) {
      setError('Failed to save FAQ');
      console.error(err);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      tags: faq.tags.join(', '),
      lang: faq.lang,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      await faqAPI.delete(id);
      fetchFaqs();
    } catch (err) {
      setError('Failed to delete FAQ');
      console.error(err);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    
    setAskLoading(true);
    try {
      const result = await faqAPI.ask({ text: askQuery });
      setAskResult(result);
    } catch (err) {
      setError('Failed to process query');
      console.error(err);
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FAQ Admin Dashboard</h1>
              {healthStatus && (
                <p className="text-sm text-gray-600">
                  Database: <span className={healthStatus.database === 'connected' ? 'text-green-600' : 'text-red-600'}>
                    {healthStatus.database}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Ask Box */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Ask Functionality</h2>
          <form onSubmit={handleAsk} className="mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={askLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {askLoading ? 'Asking...' : 'Ask'}
              </button>
            </div>
          </form>
          
          {askResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {askResult.message ? (
                <p className="text-gray-600">{askResult.message}</p>
              ) : (
                <div>
                  {askResult.ambiguous && (
                    <div className="mb-2 text-amber-600 font-medium">
                      ⚠️ Ambiguous query - multiple categories matched
                    </div>
                  )}
                  <div className="space-y-3">
                    {askResult.results.map((result, index) => (
                      <div key={result.id} className="border-l-4 border-indigo-500 pl-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">{result.question}</h3>
                          <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                            Score: {result.score}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{result.answer}</p>
                        <div className="flex gap-1 mt-2">
                          {result.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FAQ Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage FAQs</h2>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingFaq(null);
                  setFormData({ question: '', answer: '', tags: '', lang: 'en' });
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add FAQ
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., hours, schedule, opening"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={formData.lang}
                    onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    {editingFaq ? 'Update' : 'Create'} FAQ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingFaq(null);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FAQ List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading FAQs...</div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No FAQs found. Add one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-700 mb-3">{faq.answer}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                            {faq.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            Lang: {faq.lang.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(faq)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}