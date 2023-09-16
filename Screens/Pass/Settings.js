import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { SettingsData } from '../../Data/Credentials';

export default function Settings() {

    //nav props
    const nav = useNavigation();

    return (
        <View style={styles.wrapper}>
            {/*Top Bar*/}
            <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Settings</Text>
                    <Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Your account settings</Text>
                </View>
                <View>

                </View>
            </View>


            {/*Settings menu*/}
            <View style={{ margin: 15, marginTop: 30 }}>
                {SettingsData.map((item, index) => (
                    <TouchableOpacity onPress={()=>nav.navigate(item.screen)} key={index} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
                        <View style={{ backgroundColor: "#eee", padding: 10, borderRadius: 100 }}>
                            <MaterialCommunityIcons name="flag-checkered" size={24} color={item.color} />
                        </View>

                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={{ fontFamily: "lexendBold", color: item.color, fontSize: 16 }}>{item.title}</Text>
                            <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>{item.desc}</Text>
                        </View>
                        <Entypo name="chevron-right" size={24} color="#7A7B7C" />
                    </TouchableOpacity>
                ))}
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1
    }
})