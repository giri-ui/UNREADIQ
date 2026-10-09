import React, { useState } from 'react';
import { SmartReminder } from '../types';
import { alarmService } from '../utils/alarm';
import { SourceBadge } from './SourceBadge';
import {
  Bell,
  BellRing,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Volume2,
  Trash2,
  Calendar,
  AlertCircle,
  Plus,
  Sliders,
  Check,
} from 'lucide-react';

interface RemindersSectionProps {
  reminders: SmartReminder[];
  onToggleAlarm: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAddCustomReminder: (rem: SmartReminder) => void;
}

export const RemindersSection: React.FC<RemindersSectionProps> = ({
  reminders,
  onToggleAlarm,
  onToggleComplete,
  onDeleteReminder,
  onAddCustomReminder,
}) => {
  const [testChimePlaying, setTestChimePlaying] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  // Play test alarm chime
  const handleTestChime = async () => {
    setTestChimePlaying(true);
    alarmService.playAlarmChime();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const perm = await alarmService.requestNotificationPermission();
        setPermissionState(perm);
      }
      alarmService.showNotification(
        '🔔 UnreadIQ College Alarm Test',
        'Your smart college reminder alarm sound is functioning reliably!'
      );
    }

    setTimeout(() => setTestChimePlaying(false), 1400);
  };

  const handleEnableAlarm = async (reminder: SmartReminder) => {
    if (!reminder.alarmEnabled) {
      // Enabling alarm
      const perm = await alarmService.requestNotificationPermission();
      setPermissionState(perm);
      alarmService.playAlarmChime();
    }
    onToggleAlarm(reminder.id);
  };

  return (
    <section
      aria-labelledby="smart-reminders-title"
      className="w-full bg-[#111923] border border-[#1c2a38] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2a38]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#50b2ff]">
            <BellRing className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 id="smart-reminders-title" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>My Smart College Reminders & Alarms</span>
              <span className="text-[10px] bg-[#2481cc]/20 text-[#50b2ff] border border-[#2481cc]/30 px-2 py-0.5 rounded-full font-mono">
                {reminders.filter((r) => !r.completed).length} Active
              </span>
            </h2>
            <p className="text-xs text-[#708499]">
              Extracted meetings, faculty instructions, and deadlines with reliable audio alarms
            </p>
          </div>
        </div>

        {/* Test alarm chime button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestChime}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              testChimePlaying
                ? 'bg-[#2481cc] text-white border-[#2481cc]'
                : 'bg-[#152230] text-[#50b2ff] border-[#22354a] hover:bg-[#1b2b3c]'
            }`}
            title="Test audible chime and browser notification"
          >
            <Volume2 className={`w-3.5 h-3.5 ${testChimePlaying ? 'animate-bounce' : ''}`} />
            <span>{testChimePlaying ? 'Chime Ringing...' : 'Test Alarm Audio'}</span>
          </button>
        </div>
      </div>

      {/* Permissions notice banner */}
      {permissionState !== 'granted' && (
        <div className="p-3 bg-[#172435] border border-[#2481cc]/40 rounded-xl flex items-center justify-between text-xs text-[#9ab0c5]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#50b2ff] shrink-0" />
            <span>
              Enable browser notifications to receive sound alarms 15 minutes before faculty meetings and classes.
            </span>
          </div>
          <button
            onClick={async () => {
              const res = await alarmService.requestNotificationPermission();
              setPermissionState(res);
            }}
            className="px-3 py-1 bg-[#2481cc] hover:bg-[#2ea6ff] text-white font-medium rounded-lg shrink-0 ml-2"
          >
            Allow Alerts
          </button>
        </div>
      )}

      {/* Reminders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              rem.completed
                ? 'bg-[#0e1622]/50 border-[#162230] opacity-60'
                : 'bg-[#14202e] border-[#1e3044] hover:border-[#2481cc]/50 shadow-md'
            }`}
          >
            <div className="space-y-2.5">
              {/* Header with Title and Checkbox */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => onToggleComplete(rem.id)}
                    className="mt-0.5 text-[#708499] hover:text-[#25d366] transition-colors focus:outline-none"
                    aria-label={rem.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {rem.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#25d366]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#708499]" />
                    )}
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-bold text-white leading-snug ${
                        rem.completed ? 'line-through text-[#708499]' : ''
                      }`}
                    >
                      {rem.title}
                    </h3>
                    <div className="text-[11px] text-[#ffb020] font-medium">
                      With {rem.instructorOrContact}
                    </div>
                  </div>
                </div>

                {/* Alarm Status Badge */}
                <button
                  onClick={() => handleEnableAlarm(rem)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    rem.alarmEnabled
                      ? 'bg-[#2481cc]/20 border-[#2481cc]/40 text-[#50b2ff]'
                      : 'bg-[#182330] border-[#223346] text-[#708499]'
                  }`}
                  title="Toggle Alarm for this reminder"
                >
                  <Bell className="w-3 h-3" />
                  <span>{rem.alarmEnabled ? 'Alarm ON' : 'Alarm OFF'}</span>
                </button>
              </div>

              {/* Extracted Details: Location & Date/Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {rem.location && (
                  <div className="flex items-center gap-1.5 p-2 bg-[#0c141e] border border-[#182637] rounded-lg text-[#d5e5f5]">
                    <MapPin className="w-3.5 h-3.5 text-[#25d366] shrink-0" />
                    <span className="font-medium truncate">{rem.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 p-2 bg-[#0c141e] border border-[#182637] rounded-lg text-[#50b2ff]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold font-mono truncate">{rem.parsedDate}</span>
                </div>
              </div>

              {/* Advance Alarm Indicator & Source Platform */}
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#708499] px-1">
                <span className="flex items-center gap-1">
                  <span>Alerts {rem.alarmOffsetMinutes}m before meeting</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {rem.sourceApp && <SourceBadge sourceApp={rem.sourceApp} showPrefix={true} />}
                  <span className="font-mono text-[#50b2ff] truncate max-w-[130px]">{rem.sourceConversation}</span>
                </div>
              </div>

              {/* Verbatim snippet quote */}
              <blockquote className="p-2 bg-[#0a1118] border-l-2 border-[#2481cc] rounded text-[11px] italic text-[#9ab0c5]">
                "{rem.sourceMessage}"
              </blockquote>
            </div>

            {/* Actions: Delete & Completed */}
            <div className="pt-2.5 mt-2.5 border-t border-[#1c2c3e] flex items-center justify-between text-xs">
              <button
                onClick={() => onToggleComplete(rem.id)}
                className="text-[#50b2ff] hover:text-white flex items-center gap-1"
              >
                <span>{rem.completed ? 'Re-open' : 'Mark Completed'}</span>
              </button>

              <button
                onClick={() => onDeleteReminder(rem.id)}
                className="text-[#708499] hover:text-[#ff7878] p-1 transition-colors"
                title="Delete reminder"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {reminders.length === 0 && (
          <div className="p-8 bg-[#0d141e] border border-[#17222f] rounded-xl text-center text-xs text-[#708499] col-span-2">
            No smart reminders detected. Mentioning a meeting, lab, or deadline in chat will automatically generate an alarm card.
          </div>
        )}
      </div>
    </section>
  );
};
