import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MapPin, ArrowUpRight, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function HomeScreen() {
  const { currentUser, fetchUserProfile, authToken } = useContext(AppContext);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserProfile(authToken);
    setRefreshing(false);
  }, [authToken]);
  
  // VIT Bhopal exact timings (mins from midnight)
  const SLOT_MAP = {
    // Slot 1 (08:30 - 10:00)
    'A11': [510, 600], 'D11': [510, 600], 'A12': [510, 600], 'D12': [510, 600], 'A13': [510, 600], 'D13': [510, 600],
    // Slot 2 (10:05 - 11:35)
    'B11': [605, 695], 'E11': [605, 695], 'B12': [605, 695], 'E12': [605, 695], 'B13': [605, 695], 'E13': [605, 695],
    // Slot 3 (11:40 - 13:10)
    'C11': [700, 790], 'F11': [700, 790], 'C12': [700, 790], 'F12': [700, 790], 'C13': [700, 790], 'F13': [700, 790],
    // Slot 4 (13:15 - 14:45)
    'A21': [795, 885], 'D21': [795, 885], 'A22': [795, 885], 'D22': [795, 885], 'A23': [795, 885], 'D23': [795, 885],
    // Slot 5 (14:50 - 16:20)
    'A14': [890, 980], 'E14': [890, 980], 'B14': [890, 980], 'F14': [890, 980], 'C14': [890, 980], 'D14': [890, 980],
    // Slot 6 (16:25 - 17:55)
    'B21': [985, 1075], 'E21': [985, 1075], 'B22': [985, 1075], 'E22': [985, 1075], 'B23': [985, 1075], 'D24': [985, 1075],
    // Slot 7 (18:00 - 19:30)
    'C21': [1080, 1170], 'F21': [1080, 1170], 'A24': [1080, 1170], 'F22': [1080, 1170], 'B24': [1080, 1170], 'E23': [1080, 1170]
  };

  const SLOT_DAYS = {
    'MON': ['A11', 'B11', 'C11', 'A21', 'A14', 'B21', 'C21'],
    'TUE': ['D11', 'E11', 'F11', 'D21', 'E14', 'E21', 'F21'],
    'WED': ['A12', 'B12', 'C12', 'A22', 'B14', 'B22', 'A24'],
    'THU': ['D12', 'E12', 'F12', 'D22', 'F14', 'E22', 'F22'],
    'FRI': ['A13', 'B13', 'C13', 'A23', 'C14', 'B23', 'B24'],
    'SAT': ['D13', 'E13', 'F13', 'D23', 'D14', 'D24', 'E23']
  };

  const currentSemester = currentUser.current_semester;
  const semesterSchedule = (currentSemester && currentUser.schedule)
     ? currentUser.schedule.filter(s => s.semester === currentSemester)
     : (currentUser.schedule || []);
     
  const d = new Date();
  const currentMins = d.getHours() * 60 + d.getMinutes();
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const todayStr = DAYS[d.getDay()];
  
  // Format helper
  const formatTime = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const fH = h % 12 === 0 ? 12 : h % 12;
      return `${fH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  // Filter ONLY today's classes from the semester schedule
  const todaysClassesRaw = semesterSchedule.filter(cls => {
      const match = cls.time.match(/([A-G][1-2][1-4])/);
      if (match && SLOT_DAYS[todayStr]) {
          return SLOT_DAYS[todayStr].includes(match[1]);
      }
      return false; // Not a valid slot for today
  });

  // Calculate dynamic status and format times
  const dynamicSchedule = todaysClassesRaw.map(cls => {
      let status = "Upcoming";
      let displayTime = cls.time;
      let startMin = 0;
      
      const match = cls.time.match(/([A-G][1-2][1-4])/);
      if (match && SLOT_MAP[match[1]]) {
          const [start, end] = SLOT_MAP[match[1]];
          startMin = start;
          displayTime = `${formatTime(start)} - ${formatTime(end)}`;
          if (currentMins >= start && currentMins <= end) status = "Live";
          else if (currentMins > end) status = "Done";
      } else {
          if (cls.status) status = cls.status;
      }
      return { ...cls, dynamicStatus: status, displayTime, startMin };
  }).sort((a, b) => a.startMin - b.startMin);

  const currentClass = dynamicSchedule.find(c => c.dynamicStatus === "Live") || 
                       dynamicSchedule.find(c => c.dynamicStatus === "Upcoming") || 
                       dynamicSchedule[0] || 
                       { dynamicStatus: 'Free', title: 'No Classes Today', displayTime: '--:--', loc: '--', type: '--' };

  return (
    <ScrollView 
       showsVerticalScrollIndicator={false} 
       contentContainerStyle={{ paddingBottom: 100 }}
       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
    >
      {/* HEADER */}
      <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-2">
        <StyledText className="text-textLight text-xs font-bold uppercase tracking-widest mb-1">Dashboard</StyledText>
        <StyledText className="text-black text-4xl font-bold tracking-tight">Overview</StyledText>
      </Animated.View>

      {/* HERO CARD */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} className="w-full bg-surface border border-border rounded-[32px] p-8 mb-8 shadow-sm">
        <StyledView className="flex-row justify-between items-start mb-6">
          <StyledView className={`px-4 py-2 rounded-full ${currentClass.dynamicStatus === 'Live' ? 'bg-primary/10' : 'bg-gray-100'}`}>
            <StyledText className={`font-bold text-xs uppercase tracking-wider ${currentClass.dynamicStatus === 'Live' ? 'text-primary' : 'text-gray-500'}`}>
              ● {currentClass.dynamicStatus}
            </StyledText>
          </StyledView>
          <StyledText className="text-black text-2xl font-bold">{currentClass.displayTime}</StyledText>
        </StyledView>

        <StyledText className="text-black text-3xl font-bold leading-tight mb-2">{currentClass.title}</StyledText>
        <StyledView className="flex-row items-center space-x-2 mb-8">
           <MapPin size={16} color="#71717a" />
           <StyledText className="text-textLight text-lg">{currentClass.loc} • {currentClass.type}</StyledText>
        </StyledView>

        <TouchableOpacity className="bg-black h-14 w-full rounded-2xl items-center justify-center flex-row shadow-lg">
           <StyledText className="text-white font-bold text-lg mr-2">Check Materials</StyledText>
           <ArrowUpRight color="white" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity 
           onPress={() => navigation.navigate('VTOPSync')}
           className="bg-primary/10 h-14 w-full rounded-2xl items-center justify-center flex-row mt-4">
           <RefreshCw color="#6366f1" size={20} className="mr-2" />
           <StyledText className="text-primary font-bold text-lg flex-1 text-center">Sync VTOP Timetable</StyledText>
        </TouchableOpacity>
      </Animated.View>

      {/* SMART STATS */}
      <StyledText className="text-black text-2xl font-bold mb-5">Stats & Planner</StyledText>
      <StyledView className="flex-row gap-4 mb-8">
        <Animated.View entering={FadeInDown.delay(300)} className="flex-1 bg-[#EEF2FF] p-6 rounded-[28px] h-44 justify-between">
           <StyledText className="text-blue-500 font-bold text-xs uppercase">Attendance</StyledText>
           <StyledText className="text-black text-4xl font-bold">{currentUser.attendance?.toFixed(2) || '0.00'}%</StyledText>
           <StyledText className="text-textLight text-xs">{currentUser.attendance > 75 ? "Safe Zone" : "Critical Warning"}</StyledText>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400)} className="flex-1 bg-[#FFF7ED] p-6 rounded-[28px] h-44 justify-between">
           <StyledText className="text-primary font-bold text-xs uppercase">Current CGPA</StyledText>
           <StyledText className="text-black text-4xl font-bold">{currentUser.cgpa}</StyledText>
           <StyledText className="text-textLight text-xs">Top 5% of Class</StyledText>
        </Animated.View>
      </StyledView>

      {/* TIMELINE */}
      <StyledText className="text-black text-2xl font-bold mb-5">Today's Schedule</StyledText>
      {dynamicSchedule.length === 0 ? (
          <StyledText className="text-textLight italic text-center mt-4">No classes scheduled for today.</StyledText>
      ) : dynamicSchedule.map((item, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(500 + (i*100))} className="flex-row items-center mb-6">
           <StyledText className="text-textLight font-bold w-14 text-right mr-4 leading-tight">{item.displayTime.replace(" - ", "\n")}</StyledText>
           <StyledView className={`h-full w-[2px] ${item.dynamicStatus === 'Live' ? 'bg-primary' : 'bg-border'} mr-4 absolute left-[70px]`}/>
           
           <StyledView className={`flex-1 p-5 rounded-2xl border ${item.dynamicStatus === 'Live' ? 'bg-surface border-primary shadow-lg shadow-primary/10' : 'bg-surface border-border'}`}>
              <StyledText className="text-black font-bold text-lg">{item.title}</StyledText>
              <StyledText className="text-textLight text-sm">{item.loc}</StyledText>
           </StyledView>
        </Animated.View>
      ))}
    </ScrollView>
  );
}