import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, MapPin, Phone, Package, Navigation, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export default function JobDetailsScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const { token } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/shipments/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJob(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await axios.patch(`${API_URL}/shipments/${jobId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', `Status updated to ${newStatus.replace('_', ' ')}`);
      fetchJobDetails();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <View className="flex-1 bg-slate-950 items-center justify-center">
      <ActivityIndicator color="#f59e0b" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-6 py-4 flex-row items-center border-b border-slate-900">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">Job Configuration</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Header Info */}
        <View className="mb-8">
          <Text className="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-1">{job.status.replace('_', ' ')}</Text>
          <Text className="text-white font-black text-3xl tracking-tighter uppercase">{job.trackingNumber}</Text>
          <Text className="text-slate-500 text-xs font-bold mt-2">{job.packageType} • {job.weightKg} KG • {job.priority.toUpperCase()}</Text>
        </div>

        {/* Action Steps */}
        <View className="space-y-4 mb-10">
          <section className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-blue-500/10 rounded-2xl items-center justify-center">
                <MapPin size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Origin Pickup</Text>
                <Text className="text-white text-sm font-bold">{job.senderName}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">{job.senderAddress}</Text>
              </View>
              <TouchableOpacity className="p-3 bg-slate-800 rounded-2xl">
                <Phone size={18} color="white" />
              </TouchableOpacity>
            </View>
          </section>

          <View className="h-8 w-[2px] bg-slate-800 ml-11" />

          <section className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-emerald-500/10 rounded-2xl items-center justify-center">
                <Navigation size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Destination Drop</Text>
                <Text className="text-white text-sm font-bold">{job.receiverName}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">{job.receiverAddress}</Text>
              </View>
              <TouchableOpacity className="p-3 bg-slate-800 rounded-2xl">
                <Phone size={18} color="white" />
              </TouchableOpacity>
            </View>
          </section>
        </View>

        {/* Logistics Context */}
        <View className="bg-slate-900/50 p-6 rounded-[32px] border border-slate-800/50 mb-10">
           <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Cargo Overview</Text>
           <View className="flex-row justify-between mb-4">
             <View className="flex-row items-center gap-3">
               <Package size={16} color="#64748b" />
               <Text className="text-white font-bold text-xs">Service Type</Text>
             </View>
             <Text className="text-slate-400 text-xs uppercase font-black">{job.priority}</Text>
           </View>
           <View className="flex-row justify-between">
             <View className="flex-row items-center gap-3">
               <ShieldCheck size={16} color="#64748b" />
               <Text className="text-white font-bold text-xs">Security Check</Text>
             </View>
             <Text className="text-emerald-500 text-[10px] uppercase font-black">Verified</Text>
           </View>
        </View>

      </ScrollView>

      {/* Footer Workflow Controls */}
      <View className="px-6 py-6 bg-slate-950 border-t border-slate-900">
        {updating ? (
          <ActivityIndicator color="#f59e0b" />
        ) : (
          <View>
            {job.status === 'assigned' && (
              <TouchableOpacity 
                onPress={() => updateStatus('picked_up')}
                className="bg-amber-500 p-5 rounded-[24px] items-center flex-row justify-center gap-3"
              >
                <Package size={20} color="black" />
                <Text className="text-black font-black uppercase tracking-widest">Mark as Picked Up</Text>
              </TouchableOpacity>
            )}
            {job.status === 'picked_up' && (
              <TouchableOpacity 
                onPress={() => updateStatus('in_transit')}
                className="bg-primary p-5 rounded-[24px] items-center flex-row justify-center gap-3"
              >
                <Navigation size={20} color="white" />
                <Text className="text-white font-black uppercase tracking-widest">Initiate Transit</Text>
              </TouchableOpacity>
            )}
             {job.status === 'in_transit' && (
              <TouchableOpacity 
                onPress={() => updateStatus('out_for_delivery')}
                className="bg-indigo-500 p-5 rounded-[24px] items-center flex-row justify-center gap-3"
              >
                <Truck size={20} color="white" />
                <Text className="text-white font-black uppercase tracking-widest">Out for Delivery</Text>
              </TouchableOpacity>
            )}
            {job.status === 'out_for_delivery' && (
              <TouchableOpacity 
                onPress={() => updateStatus('delivered')}
                className="bg-emerald-500 p-5 rounded-[24px] items-center flex-row justify-center gap-3 shadow-xl shadow-emerald-500/20"
              >
                <CheckCircle2 size={20} color="white" />
                <Text className="text-white font-black uppercase tracking-widest">Confirm Delivery</Text>
              </TouchableOpacity>
            )}
            {(job.status === 'delivered' || job.status === 'cancelled') && (
              <View className="p-5 bg-slate-900 rounded-[24px] items-center">
                <Text className="text-slate-500 font-black uppercase tracking-widest">Stream Concluded</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
