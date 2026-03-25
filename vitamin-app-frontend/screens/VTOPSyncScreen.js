import React, { useState, useRef, useContext } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { AppContext } from '../context/AppContext';
import { X, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function VTOPSyncScreen() {
  const { currentUser, authToken, API_URL } = useContext(AppContext);
  const navigation = useNavigation();
  const webviewRef = useRef(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // This JS runs inside the WebView on every page load
  // It checks if the URL is the dashboard/main page, meaning login succeeded.
  const injectJS = `
    (function() {
       if (window.location.href.includes('/vtop/main/page') || window.location.href.includes('dashboard')) {
           window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGIN_SUCCESS',
              cookies: document.cookie
           }));
       }
    })();
    true;
  `;

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOGIN_SUCCESS') {
         setIsSyncing(true);
         
         // Send the captured cookies to our FastAPI backend to trigger the scraping Phase!
         console.log("Captured VTOP Cookies:", data.cookies);
         
         const res = await fetch(`${API_URL}/schedules/sync-vtop`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
               cookies: data.cookies
            })
         });
         
         if (res.ok) {
            setSyncSuccess(true);
            setTimeout(() => navigation.navigate('Main'), 2000);
         } else {
            Alert.alert("Sync Failed", "Could not synchronize VTOP data with the backend.");
            setIsSyncing(false);
         }
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  if (syncSuccess) {
     return (
        <View className="flex-1 bg-surface items-center justify-center p-6">
           <CheckCircle size={80} color="#10B981" className="mb-6" />
           <Text className="text-2xl font-bold text-black text-center mb-2">VTOP Sync Complete!</Text>
           <Text className="text-textLight text-center">Your timetable and attendance have been imported.</Text>
        </View>
     );
  }

  return (
    <View className="flex-1 bg-bg relative">
      {/* Header */}
      <View className="h-20 bg-surface flex-row items-end justify-between px-6 pb-4 border-b border-border shadow-sm pt-8">
         <View>
            <Text className="text-xl font-bold text-black">VTOP Login</Text>
            <Text className="text-xs text-textLight">Please login to sync your classes.</Text>
         </View>
         <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-bg rounded-full border border-border">
            <X size={20} color="black" />
         </TouchableOpacity>
      </View>

      {/* WebView */}
      {!isSyncing ? (
         <WebView
            ref={webviewRef}
            source={{ uri: 'https://vtop.vitbhopal.ac.in/vtop/open' }}
            sharedCookiesEnabled={true}
            injectedJavaScript={injectJS}
            onMessage={handleMessage}
            startInLoadingState={true}
            renderLoading={() => (
               <View className="absolute inset-0 items-center justify-center bg-bg opacity-80">
                  <ActivityIndicator size="large" color="#000" />
               </View>
            )}
         />
      ) : (
         <View className="flex-1 bg-bg items-center justify-center p-6">
            <ActivityIndicator size="large" color="#000" className="mb-6" />
            <Text className="text-xl font-bold text-black text-center mb-2">Syncing Data...</Text>
            <Text className="text-textLight text-center">Scraping classes and attendance from VTOP. Please wait.</Text>
         </View>
      )}
    </View>
  );
}
