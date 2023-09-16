import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Onboard() {
    //nav props
    const nav = useNavigation();

    const DotView = ({ selected }) => {
        return (
            <View style={{ width: selected ? 20 : 10, height: 10, backgroundColor: selected ? AppColor.Blue : "grey", margin: 10, borderRadius: 100 }} />
        )
    }
    return (
        <Onboarding
            showSkip={false}
            DoneButtonComponent={() => (
                <TouchableOpacity onPress={async () => {
                    nav.replace("Login");
                    await AsyncStorage.setItem('appLaunched', "true")
                }}>
                    <Text style={{ margin: 10, fontFamily: "lexendBold", color: AppColor.Blue }}>Get started</Text>
                </TouchableOpacity>

            )}
            showDone={true}
            DotComponent={DotView}
            pages={[
                {
                    backgroundColor: '#ECF6FB',
                    image: <Image resizeMode='contain' source={require('../../assets/img/onb1.png')} />,
                    title: <Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>All-In-One Verification</Text>,
                    subtitle: <Text style={{ fontFamily: "lexendMedium", color: "grey", textAlign: "center", margin: 10 }}>Upon verification, you get a digital ID which you can use to get verified on any platform easily.</Text>,
                },
                {
                    backgroundColor: '#F8EFEF',
                    image: <Image resizeMode='contain' source={require('../../assets/img/onb2.png')} />,
                    title: <Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>One Time Sign Up</Text>,
                    subtitle: <Text style={{ fontFamily: "lexendMedium", color: "grey", textAlign: "center", margin: 10 }}>Our verification process is designed for speed and accuracy. Don't wait any longer, start verifying your identity today with Passcoder.</Text>,
                },
                {
                    backgroundColor: '#E5E4F4',
                    image: <Image resizeMode='contain' source={require('../../assets/img/onb3.png')} />,
                    title: <Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>Encrypted Data</Text>,
                    subtitle: <Text style={{ fontFamily: "lexendMedium", color: "grey", textAlign: "center", margin: 10 }}>Our app allows you to quickly verify your identity while maintaining the highest standards of data security and privacy.</Text>,
                },
            ]}
        />
    )
}

const styles = StyleSheet.create({})