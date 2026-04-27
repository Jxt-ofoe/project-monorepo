import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Lock, Mail, Truck } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api'; // IMPORTANT: Use machine IP for physical devices

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { access_token, user } = response.data;
      
      if (user.role !== 'driver' && user.role !== 'admin') {
        throw new Error('This portal is restricted to Drivers only.');
      }

      await login(access_token, user);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Connection failed';
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-8 justify-center"
      >
        <View className="items-center mb-12">
          <View className="bg-amber-500 p-5 rounded-[32px] mb-6 shadow-xl shadow-amber-500/20">
            <Truck size={40} color="black" strokeWidth={2.5} />
          </View>
          <Text className="text-4xl font-black text-white tracking-tighter uppercase">SmartLogix</Text>
          <View className="flex-row items-center mt-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <View className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" />
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Driver Terminal</Text>
          </View>
        </div>

        <View className="space-y-4">
          <View className="relative">
            <View className="absolute left-5 top-5 z-10">
              <Mail size={18} color="#475569" />
            </View>
            <TextInput
              className="bg-slate-900 text-white p-5 pl-14 rounded-3xl border border-slate-800 font-medium"
              placeholder="Email Identity"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="relative">
            <View className="absolute left-5 top-5 z-10">
              <Lock size={18} color="#475569" />
            </View>
            <TextInput
              className="bg-slate-900 text-white p-5 pl-14 rounded-3xl border border-slate-800 font-medium"
              placeholder="Security Key"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className={`bg-amber-500 p-5 rounded-3xl items-center mt-6 shadow-2xl shadow-amber-500/40 ${loading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-black font-black text-sm uppercase tracking-widest">Authorize Access</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
          <Text className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center px-10 leading-relaxed">
            By accessing this terminal you agree to the SmartLogix Fleet protocols.
          </Text>
        </div>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
