import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppContext } from '../context/AppContext'; // <--- NEW IMPORT
import { MapPin, ArrowUpRight } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function HomeScreen() {
  const { currentUser } = useContext(AppContext);
  const currentClass = currentUser.schedule.find(c => c.status === "Live") || currentUser.schedule[0];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* HEADER */}
      <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-2">
        <StyledText className="text-textLight text-xs font-bold uppercase tracking-widest mb-1">Dashboard</StyledText>
        <StyledText className="text-black text-4xl font-bold tracking-tight">Overview</StyledText>
      </Animated.View>

      {/* HERO CARD */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} className="w-full bg-surface border border-border rounded-[32px] p-8 mb-8 shadow-sm">
        <StyledView className="flex-row justify-between items-start mb-6">
          <StyledView className={`px-4 py-2 rounded-full ${currentClass.status === 'Live' ? 'bg-primary/10' : 'bg-gray-100'}`}>
            <StyledText className={`font-bold text-xs uppercase tracking-wider ${currentClass.status === 'Live' ? 'text-primary' : 'text-gray-500'}`}>
              ● {currentClass.status}
            </StyledText>
          </StyledView>
          <StyledText className="text-black text-2xl font-bold">{currentClass.time}</StyledText>
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
      </Animated.View>

      {/* SMART STATS */}
      <StyledText className="text-black text-2xl font-bold mb-5">Stats & Planner</StyledText>
      <StyledView className="flex-row gap-4 mb-8">
        <Animated.View entering={FadeInDown.delay(300)} className="flex-1 bg-[#EEF2FF] p-6 rounded-[28px] h-44 justify-between">
           <StyledText className="text-blue-500 font-bold text-xs uppercase">Attendance</StyledText>
           <StyledText className="text-black text-4xl font-bold">{currentUser.attendance}%</StyledText>
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
      {currentUser.schedule.map((item, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(500 + (i*100))} className="flex-row items-center mb-6">
           <StyledText className="text-textLight font-bold w-14 text-right mr-4">{item.time}</StyledText>
           <StyledView className={`h-full w-[2px] ${item.status === 'Live' ? 'bg-primary' : 'bg-border'} mr-4 absolute left-[70px]`}/>
           
           <StyledView className={`flex-1 p-5 rounded-2xl border ${item.status === 'Live' ? 'bg-surface border-primary shadow-lg shadow-primary/10' : 'bg-surface border-border'}`}>
              <StyledText className="text-black font-bold text-lg">{item.title}</StyledText>
              <StyledText className="text-textLight text-sm">{item.loc}</StyledText>
           </StyledView>
        </Animated.View>
      ))}
    </ScrollView>
  );
}