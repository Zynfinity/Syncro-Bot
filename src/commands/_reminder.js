const schedule = require('node-schedule');
const supabase = require('../libs/supabaseClient');
const { formatDate } = require('../libs/util');
const moment = require('moment');

const Reminders = async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const fetchReminders = async (date, limit = 5) => {
    let query = supabase.from('reminders').select("*");
    const formattedDate = `${formatDate(date, 'yyyy-mm-dd')}T00:00:00+00:00`;
    if (date) {
      if (!limit) query = query.eq('tanggal', formattedDate);
    }
    if (limit) {
      query = query.gte('tanggal', formattedDate)
      query = query.order('tanggal', { ascending: true }).limit(limit);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching reminders:', error);
      return { data: null, error };
    }
    return { data, error: null };
  };

  const { data: rtoday, error: todayError } = await fetchReminders(today, null);
  const { data: rtomorrow, error: tomorrowError } = await fetchReminders(tomorrow, 5);

  if (todayError || tomorrowError) {
    console.error('Error fetching reminders:', todayError || tomorrowError);
    return;
  }
  rtoday.forEach(reminder => reminder.isTomorrow = false);
  rtomorrow.forEach(reminder => reminder.isTomorrow = true);

  const combinedReminders = [...rtoday, ...rtomorrow];

  const remindersByContact = combinedReminders.reduce((result, reminder) => {
    const { contact } = reminder;
    if (!result[contact]) {
      result[contact] = [];
    }
    result[contact].push(reminder);
    return result;
  }, {});

  for (const [contact, reminders] of Object.entries(remindersByContact)) {
    let msg = `*Pemberitahuan Event*\n\n`;
    const remindersToday = reminders.filter(reminder => !reminder.isTomorrow);
    const remindersTomorrow = reminders.filter(reminder => reminder.isTomorrow);
    if (remindersToday.length) {
      msg += `*Event Hari Ini*\n`;
      remindersToday.forEach(reminder => {
        msg += `- Tanggal : ${formatDate(today, 'dd-mm-yyyy')}\n`;
        msg += `- Event   : ${reminder.event_name}\n\n`;
      });
    }
    if (remindersTomorrow.length) {
      msg += '--------------------------------\n\n';
      msg += `*Event Yang Akan Datang*\n`;
      remindersTomorrow.forEach(reminder => {
        msg += `- Tanggal : ${formatDate(tomorrow, 'dd-mm-yyyy')}\n`;
        msg += `- Event   : ${reminder.event_name}\n\n`;
      });
    }
    conn.sendMessage(contact, {
      text: msg,
      contextInfo: {
        externalAdReply: {
          title: 'Syncro Bot',
          body: 'Bots make things easier for you with existing features',
          thumbnailUrl: 'https://cdn.sazumi.moe/file/wlozpj.jpg',
          sourceUrl: 'https://github.com/xfar05/shinoa-bot',
          mediaType: 1,
          renderLargerThumbnail: true,
        }
      }
    });
  }
};

const job = () => {
  console.log('Ready');
  schedule.scheduleJob('* * 6 * * *', () => {
    Reminders();
  });
}

module.exports = job;
