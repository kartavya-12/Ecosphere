import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      // use "issues" table because of the previous schema migration
      let query = supabase.from('issues').select('*').order('created_at', { ascending: false });

      if (user?.role === 'community' || user?.role === 'volunteer') {
        query = query.eq('reporter_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  const addReport = async (reportData) => {
    const { data, error } = await supabase
      .from('issues')
      .insert([{ 
        title: reportData.title, 
        description: reportData.description, 
        location: reportData.location,
        reporter_id: user.id 
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  };

  const updateReportStatus = async (reportId, status) => {
    const { error } = await supabase
      .from('issues')
      .update({ status })
      .eq('id', reportId);
    
    if (error) throw error;
  };

  useEffect(() => {
    if (!user) return;
    fetchReports();

    const channel = supabase
      .channel('issues_changes')
      .on('postgres_changes', { event: '*', table: 'issues' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReport = payload.new;
            if (user.role !== 'community' && user.role !== 'volunteer' || newReport.reporter_id === user.id) {
              setReports(prev => [newReport, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setReports(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
          } else if (payload.eventType === 'DELETE') {
            setReports(prev => prev.filter(r => r.id === payload.old.id));
          }
        })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, fetchReports]);

  return { reports, loading, error, addReport, updateReportStatus, refresh: fetchReports };
}

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (!error) setEvents(data || []);
    setLoading(false);
  }, []);

  const addEvent = async (eventData) => {
    const { data, error } = await supabase.from('events').insert([eventData]).select();
    if (error) throw error;
    return data[0];
  };

  const updateEventStatus = async (eventId, status) => {
    const { error } = await supabase.from('events').update({ status }).eq('id', eventId);
    if (error) throw error;
  };

  useEffect(() => {
    fetchEvents();
    const channel = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', table: 'events' }, (payload) => {
        if (payload.eventType === 'INSERT') setEvents(prev => [payload.new, ...prev]);
        else if (payload.eventType === 'UPDATE') setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
        else if (payload.eventType === 'DELETE') setEvents(prev => prev.filter(e => e.id === payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchEvents]);

  return { events, loading, refresh: fetchEvents, addEvent, updateEventStatus };
}

export function useRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('event_registrations').select('*');
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const registerForEvent = async (eventId, notes = '') => {
    const { data, error } = await supabase.from('event_registrations').insert([{
      event_id: eventId,
      volunteer_id: user.id,
      volunteer_name: user?.user_metadata?.name || user?.name || 'Volunteer',
      notes
    }]).select();
    if (error) throw error;
    return data[0];
  };

  const updateRegistrationStatus = async (regId, status) => {
    const { error } = await supabase.from('event_registrations').update({ status }).eq('id', regId);
    if (error) throw error;
  };

  useEffect(() => {
    fetchRegistrations();
    if (!user) return;

    const channel = supabase
      .channel('registrations_changes')
      .on('postgres_changes', { event: '*', table: 'event_registrations' }, (payload) => {
        if (payload.eventType === 'INSERT') setRegistrations(prev => [payload.new, ...prev]);
        else if (payload.eventType === 'UPDATE') setRegistrations(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
        else if (payload.eventType === 'DELETE') setRegistrations(prev => prev.filter(r => r.id === payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, fetchRegistrations]);

  return { registrations, loading, refresh: fetchRegistrations, registerForEvent, updateRegistrationStatus };
}

export function useGlobalStats() {
  const [stats, setStats] = useState({ carbon_offset: '1.2M Tons', total_volunteers: 84000 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.from('global_stats').select('*').single();
      if (!error && data) setStats(data);
      setLoading(false);
    };

    fetchStats();
    const channel = supabase.channel('stats_changes').on('postgres_changes', { event: 'UPDATE', table: 'global_stats' }, (payload) => setStats(payload.new)).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return { stats, loading };
}
