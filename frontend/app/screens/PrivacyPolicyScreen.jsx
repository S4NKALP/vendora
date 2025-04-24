import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { getPrivacyPolicy } from '../api';

export default function PrivacyPolicyScreen() {
    const navigation = useNavigation();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPrivacyPolicies();
    }, []);

    const fetchPrivacyPolicies = async () => {
        try {
            setLoading(true);
            const data = await getPrivacyPolicy();
            setPolicies(data);
        } catch (err) {
            setError('Failed to load privacy policies');
            console.error('Error fetching privacy policies:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (content) => {
        // Split content into sections based on numbered points
        const sections = content.split(/\d+\./).filter(section => section.trim());
        
        return sections.map((section, index) => {
            const lines = section.split('\n').filter(line => line.trim());
            return (
                <View key={index} className="mb-4">
                    {lines.map((line, lineIndex) => {
                        // Check if line is a sub-point (starts with spaces)
                        const isSubPoint = line.trim().startsWith('-') || line.trim().startsWith('•');
                        return (
                            <Text 
                                key={lineIndex} 
                                className={`${lineIndex === 0 ? 'text-lg font-semibold' : 'text-base'} ${isSubPoint ? 'ml-4' : ''} text-gray-700 mb-1`}
                            >
                                {line.trim()}
                            </Text>
                        );
                    })}
                </View>
            );
        });
    };

    return (
        <View className={`bg-white`} style={{ height: hp('97%') }}>
            <TabBar
                prefix={""}
                title={"Privacy Policy"}
                suffix={<ChevronLeftIcon size={25} color={'black'} />}
                titleStyle={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: 20
                }}
                prefixStyle={{
                    backgroundColor: "transparent"
                }}
                suffixStyle={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: "black"
                }}
                containerStyle=""
                suffixAction={() => navigation.goBack()}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={`mx-4 mt-2`}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : error ? (
                        <Text className="text-red-500 text-center">{error}</Text>
                    ) : policies.length > 0 ? (
                        policies.map((policy, index) => (
                            <View key={index} className="mb-8">
                                <Text className={`text-primary font-semibold text-2xl mb-4`}>
                                    {policy.title}
                                </Text>
                                {renderContent(policy.content)}
                            </View>
                        ))
                    ) : (
                        <Text className="text-center">No privacy policies available</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}