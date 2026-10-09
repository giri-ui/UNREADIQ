import React, { useState } from 'react';
import { UserProfile, VipContact } from '../types';
import { X, User, Plus, Trash2, Shield, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [preferredName, setPreferredName] = useState(userProfile.preferredName);
  const [aliasesText, setAliasesText] = useState(userProfile.aliases.join(', '));
  const [vipList, setVipList] = useState<VipContact[]>(userProfile.vipContacts);

  // New VIP input state
  const [newVipName, setNewVipName] = useState('');
  const [newVipRole, setNewVipRole] = useState('Manager');

  if (!isOpen) return null;

  const handleAddVip = () => {
    if (!newVipName.trim()) return;
    const newContact: VipContact = {
      id: `vip-${Date.now()}`,
      name: newVipName.trim(),
      role: newVipRole.trim(),
      aliases: [newVipName.trim()],
    };
    setVipList([...vipList, newContact]);
    setNewVipName('');
  };

  const handleRemoveVip = (id: string) => {
    setVipList(vipList.filter((v) => v.id !== id));
  };

  const handleSave = () => {
    const parsedAliases = aliasesText
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const updated: UserProfile = {
      fullName: fullName.trim() || 'Alex Morgan',
      preferredName: preferredName.trim() || 'Alex',
      aliases: parsedAliases.length > 0 ? parsedAliases : [preferredName.trim()],
      vipContacts: vipList,
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#0f1722] border border-[#203247] rounded-2xl shadow-2xl p-5 sm:p-6 text-white overflow-y-auto max-h-[90vh] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1c2c3e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#50b2ff]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-white">
                Personal Mention & VIP Leadership Profile
              </h2>
              <p className="text-xs text-[#708499]">
                Configure how UnreadIQ identifies you and tracks key leaders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#708499] hover:text-white rounded-lg hover:bg-[#1a2839]"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: User Identity & Aliases */}
        <div className="space-y-3 p-4 bg-[#14202e] border border-[#1e3044] rounded-xl text-xs">
          <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#50b2ff]">
            1. Your Name & Aliases
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9ab0c5] mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0c141d] border border-[#1c2a38] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#2481cc]"
                placeholder="Alex Morgan"
              />
            </div>
            <div>
              <label className="block text-[#9ab0c5] mb-1">Preferred First Name</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full bg-[#0c141d] border border-[#1c2a38] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#2481cc]"
                placeholder="Alex"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9ab0c5] mb-1">
              Known Aliases & Handles (comma-separated)
            </label>
            <input
              type="text"
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              className="w-full bg-[#0c141d] border border-[#1c2a38] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#2481cc]"
              placeholder="Alex, @alex, alex.m, Morgan"
            />
            <p className="text-[10px] text-[#708499] mt-1">
              UnreadIQ tracks these in group chats to detect assignments and direct mentions.
            </p>
          </div>
        </div>

        {/* Section 2: Important VIP Contacts & Roles */}
        <div className="space-y-3 p-4 bg-[#14202e] border border-[#1e3044] rounded-xl text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#ffb020] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>2. Designated Important People & Roles</span>
            </h3>
            <span className="text-[10px] text-[#708499]">
              {vipList.length} configured
            </span>
          </div>

          <p className="text-[11px] text-[#9ab0c5]">
            Add faculty, proctors, teachers, and classmates (e.g. Principal, Proctor, HOD, Subject Teacher, CR, Project Lead). Messages from them are prioritized.
          </p>

          {/* Current VIPs list */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {vipList.map((vip) => (
              <div
                key={vip.id}
                className="flex items-center justify-between p-2 bg-[#0c141e] border border-[#1a2838] rounded-lg"
              >
                <div>
                  <span className="font-semibold text-white mr-2">{vip.name}</span>
                  <span className="text-[10px] text-[#ffb020] bg-[#ffb020]/15 px-1.5 py-0.2 rounded font-medium">
                    {vip.role}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveVip(vip.id)}
                  className="text-[#708499] hover:text-[#ff7878] p-1"
                  title="Remove contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add VIP Form */}
          <div className="pt-2 border-t border-[#1a2838] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={newVipName}
              onChange={(e) => setNewVipName(e.target.value)}
              placeholder="Name (e.g. Prof. Ravi Kumar)"
              className="flex-1 bg-[#0c141d] border border-[#1c2a38] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2481cc]"
            />
            <select
              value={newVipRole}
              onChange={(e) => setNewVipRole(e.target.value)}
              className="bg-[#0c141d] border border-[#1c2a38] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2481cc]"
            >
              <option value="Principal">Principal</option>
              <option value="Proctor">Proctor</option>
              <option value="HOD">HOD</option>
              <option value="Subject Teacher">Subject Teacher</option>
              <option value="Class Representative (CR)">Class Representative (CR)</option>
              <option value="Project Lead">Project Lead</option>
              <option value="Classmate">Classmate</option>
              <option value="Lab Instructor">Lab Instructor</option>
              <option value="Family">Family</option>
            </select>
            <button
              onClick={handleAddVip}
              className="px-3 py-1.5 bg-[#2481cc] hover:bg-[#2ea6ff] text-white font-semibold rounded-lg flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1c2c3e] flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#9ab0c5] hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 font-semibold bg-[#2481cc] hover:bg-[#2ea6ff] text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
