import 'react-native-gesture-handler';
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, Modal, TextInput, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Home, Zap, Calendar, Users, MessageSquare, Bot, LogOut, X, Send, Bell } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import GoalsScreen from './screens/GoalsScreen';
import EventsScreen from './screens/EventsScreen';
import BuddyScreen from './screens/BuddyScreen';
import VTOPSyncScreen from './screens/VTOPSyncScreen';

// Import Context
import { AppProvider, AppContext } from './context/AppContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <NavigationContainer>
           <MainNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AppProvider>
  );
}

function MainNavigator() {
  const { currentUser } = useContext(AppContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!currentUser ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
           <Stack.Screen name="Main" component={MainLayout} />
           <Stack.Screen name="VTOPSync" component={VTOPSyncScreen} options={{ presentation: 'modal' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

// === MAIN LAYOUT ===
function MainLayout() {
  const { currentUser, logout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCocoOpen, setCocoOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  
  const offset = useSharedValue(-300); 
  const toggleSidebar = () => {
    const isOpen = !isSidebarOpen;
    setSidebarOpen(isOpen);
    offset.value = withTiming(isOpen ? 0 : -300, { duration: 300 });
  };
  const animatedSidebarStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const renderScreen = () => {
    switch(activeTab) {
      case 'Home': return <HomeScreen />;
      case 'Goals': return <GoalsScreen />;
      case 'Events': return <EventsScreen />;
      case 'Buddy': return <BuddyScreen />;
      case 'Chat': return <ChatScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg relative">
      
      {/* HEADER */}
      <StyledView className="flex-row justify-between items-center px-6 py-4 z-10 bg-bg/90 backdrop-blur-md border-b border-border/50">
        <TouchableOpacity onPress={toggleSidebar} className="p-2 bg-surface rounded-full border border-border shadow-sm">
          <Menu color="black" size={24} />
        </TouchableOpacity>
        
        <Image source={require('./assets/images/logo.png')} className="h-8 w-8" resizeMode="contain" />
        
        <TouchableOpacity onPress={() => setNotifOpen(true)} className="p-2 bg-surface rounded-full border border-border shadow-sm relative">
          <Bell color="black" size={24} />
          <StyledView className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
        </TouchableOpacity>
      </StyledView>

      {/* SCREEN CONTENT */}
      <StyledView className="flex-1 px-6 pt-2">
        {renderScreen()}
      </StyledView>

      {/* COCO BOT (HIDDEN ON CHAT) */}
      {activeTab !== 'Chat' && (
        <TouchableOpacity 
          onPress={() => setCocoOpen(true)}
          className="absolute bottom-8 right-6 h-16 w-16 bg-black rounded-full items-center justify-center shadow-2xl z-20"
        >
          <Bot color="white" size={28} />
        </TouchableOpacity>
      )}

      {/* SIDEBAR */}
      {isSidebarOpen && <TouchableOpacity activeOpacity={1} onPress={toggleSidebar} className="absolute inset-0 bg-black/20 z-40" />}
      <Animated.View style={[animatedSidebarStyle]} className="absolute top-0 bottom-0 left-0 w-[75%] bg-surface z-50 shadow-2xl border-r border-border p-6 pt-16">
        <StyledView className="mb-10">
           <StyledText className="text-3xl font-bold text-black tracking-tighter">VITamin<StyledText className="text-primary">.</StyledText></StyledText>
           <StyledText className="text-textLight text-sm mt-1">Hello, {currentUser.name.split(' ')[0]}</StyledText>
        </StyledView>
        <StyledView className="space-y-3">
          {['Home', 'Goals', 'Events', 'Buddy', 'Chat'].map((tab) => (
             <SidebarItem key={tab} label={tab} active={activeTab === tab} onPress={() => { setActiveTab(tab); toggleSidebar(); }} />
          ))}
        </StyledView>
        <TouchableOpacity onPress={logout} className="absolute bottom-10 left-6 flex-row items-center space-x-3">
          <LogOut size={20} color="#EF4444" />
          <StyledText className="text-red-500 font-bold">Logout</StyledText>
        </TouchableOpacity>
      </Animated.View>

      {/* MODALS */}
      <Modal visible={isCocoOpen} animationType="slide" transparent={true} onRequestClose={() => setCocoOpen(false)}>
         <CocoBot onClose={() => setCocoOpen(false)} user={currentUser} />
      </Modal>
      <Modal visible={isNotifOpen} animationType="fade" transparent={true} onRequestClose={() => setNotifOpen(false)}>
         <NotificationPopup onClose={() => setNotifOpen(false)} />
      </Modal>

    </SafeAreaView>
  );
}

const SidebarItem = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} className={`flex-row items-center p-4 rounded-2xl ${active ? 'bg-primary/10' : 'bg-transparent'}`}>
    <StyledText className={`ml-4 font-bold text-lg ${active ? 'text-primary' : 'text-textLight'}`}>{label}</StyledText>
  </TouchableOpacity>
);

function NotificationPopup({ onClose }) {
  return (
    <View className="flex-1 bg-black/50 justify-center items-center px-6">
      <View className="bg-surface w-full rounded-3xl p-6 shadow-2xl">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-black">Notifications</Text>
          <TouchableOpacity onPress={onClose}><X color="black" size={24}/></TouchableOpacity>
        </View>
        <View className="space-y-4">
           <NotifItem title="Class Reminder" desc="Compiler Design Lab starts in 15 mins." time="Now" />
           <NotifItem title="New Event" desc="HackTheFall 2.0 registration opens today." time="2h ago" />
           <NotifItem title="Coco Bot" desc="You missed your goal streak yesterday!" time="5h ago" />
        </View>
      </View>
    </View>
  );
}

const NotifItem = ({ title, desc, time }) => (
  <View className="flex-row items-start border-b border-border pb-3">
    <View className="h-2 w-2 bg-primary rounded-full mt-2 mr-3" />
    <View className="flex-1">
      <Text className="font-bold text-black">{title}</Text>
      <Text className="text-textLight text-xs">{desc}</Text>
    </View>
    <Text className="text-textLight text-[10px]">{time}</Text>
  </View>
);

function CocoBot({ onClose, user }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(`Hi ${user.name.split(' ')[0]}! Ask me about your schedule, attendance, or goals.`);
  const handleAsk = () => {
    const q = query.toLowerCase();
    if (q.includes('schedule') || q.includes('class')) setResponse(`You have ${user.schedule.length} classes today.`);
    else if (q.includes('attendance')) setResponse(`Your attendance is ${user.attendance}%.`);
    else setResponse("I can help with VTOP sync and finding buddies.");
    setQuery('');
  };
  return (
    <View className="flex-1 justify-end bg-black/50">
       <View className="bg-surface h-[50%] rounded-t-[40px] p-6 shadow-2xl">
          <View className="flex-row justify-between items-center mb-4">
             <Text className="font-bold text-xl text-black">Coco AI</Text>
             <TouchableOpacity onPress={onClose}><X color="black" size={24}/></TouchableOpacity>
          </View>
          <ScrollView className="flex-1 bg-bg rounded-3xl p-4 mb-4"><Text className="text-black text-lg leading-7">{response}</Text></ScrollView>
          <View className="flex-row items-center bg-bg rounded-full px-2 border border-border h-14">
             <TextInput value={query} onChangeText={setQuery} placeholder="Ask Coco..." className="flex-1 p-4 text-black" />
             <TouchableOpacity onPress={handleAsk} className="h-10 w-10 bg-black rounded-full items-center justify-center m-1"><Send size={18} color="white" /></TouchableOpacity>
          </View>
       </View>
    </View>
  );
}