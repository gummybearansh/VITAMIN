import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { AppContext } from '../context/AppContext'; // <--- NEW IMPORT
import Animated, { FadeInDown } from 'react-native-reanimated';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function BuddyScreen() {
  const { currentUser, allUsers } = useContext(AppContext);
  
  // Filter out the current user
  const buddies = allUsers.filter(u => u.id !== currentUser.id);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
       <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-2">
         <StyledText className="text-textLight text-xs font-bold uppercase tracking-widest mb-1">ML Matchmaking</StyledText>
         <StyledText className="text-black text-4xl font-bold tracking-tight">Study Buddies</StyledText>
       </Animated.View>

       {buddies.map((buddy, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i*150)} className="bg-surface p-6 rounded-3xl border border-border mb-4 flex-row justify-between items-center shadow-sm">
             <StyledView className="flex-1">
                <StyledText className="text-black text-xl font-bold">{buddy.name}</StyledText>
                <StyledText className="text-primary font-bold text-sm">95% Compatibility</StyledText>
                <StyledText className="text-textLight text-sm mt-1">{buddy.branch}</StyledText>
             </StyledView>
             
             <StyledView className="h-12 w-12 bg-bg rounded-full items-center justify-center border border-border">
                <StyledText className="font-bold text-lg">{buddy.avatar}</StyledText>
             </StyledView>
          </Animated.View>
       ))}
    </ScrollView>
  );
}