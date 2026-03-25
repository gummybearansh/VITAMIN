import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { AppContext } from '../context/AppContext'; // <--- NEW IMPORT
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function GoalsScreen() {
  const { currentUser } = useContext(AppContext);
  const categories = Object.keys(currentUser.goals);
  const [expanded, setExpanded] = useState(categories[0]); // Open first category by default

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-2">
         <StyledText className="text-textLight text-xs font-bold uppercase tracking-widest mb-1">Target Tracker</StyledText>
         <StyledText className="text-black text-4xl font-bold tracking-tight">Your Goals</StyledText>
      </Animated.View>

      {categories.map((cat, i) => (
        <Animated.View key={cat} entering={FadeInDown.delay(i * 100)} className="mb-4">
           {/* Category Header */}
           <TouchableOpacity 
              onPress={() => setExpanded(expanded === cat ? null : cat)} 
              className={`flex-row justify-between items-center p-5 rounded-2xl border ${expanded === cat ? 'bg-black border-black' : 'bg-surface border-border'}`}
           >
              <StyledText className={`text-xl font-bold ${expanded === cat ? 'text-white' : 'text-black'}`}>{cat}</StyledText>
              {expanded === cat ? <ChevronUp color="white"/> : <ChevronDown color="black"/>}
           </TouchableOpacity>
           
           {/* Expanded Content */}
           {expanded === cat && (
             <View className="mt-3 pl-2">
                {currentUser.goals[cat].map((goal, idx) => (
                   <View key={idx} className="bg-surface p-5 rounded-2xl border border-border mb-3 ml-2 shadow-sm">
                      <View className="flex-row justify-between mb-3">
                        <StyledText className="font-bold text-lg text-black">{goal.title}</StyledText>
                        <StyledText className="text-primary font-bold">🔥 {goal.streak}</StyledText>
                      </View>
                      
                      {/* Progress Bar */}
                      <View className="h-3 bg-bg rounded-full overflow-hidden">
                        <View className="h-full bg-primary" style={{ width: `${goal.progress * 100}%` }}/>
                      </View>
                      <StyledText className="text-right text-textLight text-xs mt-2">{goal.progress * 100}% Completed</StyledText>
                   </View>
                ))}
             </View>
           )}
        </Animated.View>
      ))}
    </ScrollView>
  );
}