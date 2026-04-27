import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { Truck, MapPin, Package, Bell, User, ChevronRight, Activity } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001/api';

export default function DashboardScreen({ navigation }: any) {
  const { user, token, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/driver/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Socket.io integration
    const socket = io('http://localhost:3001'); // Use machine IP for physical
    
    socket.on('connect', () => {
      console.log('Connected to socket');
      // Join driver-specific room
      if (user?.id) {
        socket.emit('join_room', { roomId: `driver_${user.id}` });
      }
    });

    socket.on('job_assigned', (newJob) => {
      Alert.alert('New Job Assigned!', `Shipment ${newJob.trackingNumber} has been assigned to you.`);
      fetchJobs();
    });

    socket.on('shipment_status_updated', () => {
      fetchJobs();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Terminate active session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-900">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={handleLogout} className="w-10 h-10 bg-slate-900 rounded-2xl items-center justify-center border border-slate-800">
            <User size={20} color="#f59e0b" />
          </TouchableOpacity>
          <View>
            <Text className="text-white font-black text-xs uppercase tracking-widest">{user?.fullName}</Text>
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Courier ID: {user?.id.slice(0, 8)}</Text>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-slate-900 rounded-2xl items-center justify-center">
          <Bell size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        {/* Active Stats */}
        <View className="flex-row gap-4 mb-8">
           <View className="flex-1 bg-slate-900/50 p-4 rounded-3xl border border-slate-800/50">
             <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Queue</Text>
             <Text className="text-2xl font-black text-white">{jobs.filter(j => j.status === 'assigned').length}</Text>
           </View>
           <View className="flex-1 bg-amber-500/10 p-4 rounded-3xl border border-amber-500/20">
             <Text className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">En-Route</Text>
             <Text className="text-2xl font-black text-amber-500">{jobs.filter(j => ['picked_up', 'in_transit', 'out_for_delivery'].includes(j.status)).length}</Text>
           </View>
        </View>

        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-black text-white uppercase tracking-tighter">Assigned Streams</Text>
          <TouchableOpacity onPress={fetchJobs}>
            <Activity size={16} color="#f59e0b" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-20 items-center">
            <Text className="text-slate-600 font-black uppercase text-[10px] tracking-[0.2em]">Synchronizing Operations...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View className="py-20 items-center bg-slate-900/20 rounded-[40px] border border-dashed border-slate-800">
            <Package size={48} color="#1e293b" />
            <Text className="text-slate-500 font-bold mt-4 text-center px-10 leading-tight">No active assignments in your queue.</Text>
          </View>
        ) : (
          <View className="space-y-4 pb-20">
            {jobs.map((job: any) => (
              <TouchableOpacity 
                key={job.id}
                onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
                className="bg-slate-900 p-5 rounded-[32px] border border-slate-800"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text className="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-1">{job.status.replace('_', ' ')}</Text>
                    <Text className="text-white font-black text-lg tracking-tighter">{job.trackingNumber}</Text>
                  </View>
                  <View className="bg-slate-800 px-3 py-1.5 rounded-full">
                    <Text className="text-white font-black text-[8px] uppercase tracking-widest">{job.priority}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-8 h-8 bg-slate-800 rounded-xl items-center justify-center">
                    <MapPin size={14} color="#64748b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Delivery Point</Text>
                    <Text className="text-slate-200 text-xs font-bold truncate">{job.receiverAddress}</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-4 border-t border-slate-800">
                  <View className="flex-row items-center gap-2">
                    <Truck size={14} color="#64748b" />
                    <Text className="text-slate-500 text-[10px] font-bold uppercase">{job.packageType}</Text>
                  </View>
                  <ChevronRight size={16} color="#475569" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Mobile */}
      <View className="absolute bottom-10 self-center">
         <TouchableOpacity className="bg-amber-500 px-8 py-4 rounded-full shadow-2xl shadow-amber-500/40 flex-row items-center gap-2">
           <View className="w-2 h-2 rounded-full bg-black animate-pulse" />
           <Text className="text-black font-black uppercase text-xs tracking-widest">Ready for Pickups</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
