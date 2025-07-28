import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const RewardSystemComponent = ({ streak, rewards }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.streakText}>🔥 Streak: {streak} days</Text>
            <View style={styles.rewardsContainer}>
                {rewards.map((reward, index) => (
                    <Image key={index} source={reward.image} style={styles.rewardImage} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 20,
    },
    streakText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF4500',
    },
    rewardsContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    rewardImage: {
        width: 50,
        height: 50,
        marginHorizontal: 5,
    },
});

export default RewardSystemComponent;
