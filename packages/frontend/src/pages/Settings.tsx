import { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useApi';
import { InterestTag } from '../components/InterestTag';

const SUGGESTED_INTERESTS = [
  'AI/ML',
  'AWS Services',
  'Distributed Systems',
  'Rust Programming',
  'Web Development',
  'Cloud Security',
  'DevOps',
  'Kubernetes',
  'Python',
  'TypeScript',
  'Open Source',
  'Data Engineering',
];

export function Settings() {
  const { user, loading, error, updateProfile } = useProfile();
  const [interests, setInterests] = useState<string[]>([]);
  const [preferencePrompt, setPreferencePrompt] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (user) {
      setInterests(user.interests || []);
      setPreferencePrompt(user.preferencePrompt || '');
    }
  }, [user]);

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && interests.length < 4 && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setNewInterest('');
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (interests.length === 0) {
      setSaveError('Please add at least one interest area');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      await updateProfile(interests, preferencePrompt || undefined);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Research Preferences</h1>
      <p className="text-gray-600 mb-8">
        Configure your interest areas and preferences to personalize your daily summaries.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Interest Areas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Interest Areas</h2>
        <p className="text-sm text-gray-500 mb-4">
          Add up to 4 topics you'd like research summaries on ({interests.length}/4)
        </p>

        {/* Current interests */}
        <div className="flex flex-wrap gap-2 mb-4">
          {interests.map((interest, index) => (
            <InterestTag
              key={index}
              label={interest}
              onRemove={() => removeInterest(index)}
            />
          ))}
          {interests.length === 0 && (
            <p className="text-sm text-gray-400 italic">No interests configured yet</p>
          )}
        </div>

        {/* Add new interest */}
        {interests.length < 4 && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInterest(newInterest);
                }
              }}
              placeholder="Type a custom interest..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              maxLength={100}
            />
            <button
              onClick={() => addInterest(newInterest)}
              disabled={!newInterest.trim()}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        )}

        {/* Suggestions */}
        {interests.length < 4 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_INTERESTS.filter((s) => !interests.includes(s)).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => addInterest(suggestion)}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-700 rounded-full border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preference Prompt */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Research Preferences</h2>
        <p className="text-sm text-gray-500 mb-4">
          Describe how you'd like your summaries. This helps the AI tailor content to your needs.
        </p>
        <textarea
          value={preferencePrompt}
          onChange={(e) => setPreferencePrompt(e.target.value)}
          placeholder="E.g., I prefer technical deep-dives over news summaries. Focus on practical implementations and new open-source tools. Skip marketing announcements."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {preferencePrompt.length}/1000 characters
        </p>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between">
        <div>
          {saveSuccess && (
            <span className="text-sm text-green-600 font-medium">✓ Settings saved successfully!</span>
          )}
          {saveError && (
            <span className="text-sm text-red-600">{saveError}</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
