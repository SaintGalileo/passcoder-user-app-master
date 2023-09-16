import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';

export default function EditBvn() {

    const nav = useNavigation();
    const [bvnNumber, setBvnnumber] = useState('');
    const [loading, setLoading] = useState(false)


    async function GetBVN(){
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/bvn`, {
          method: "POST",
          headers: {
            'passcoder-access-token': userToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
    
          }
        }).then(async (res) => {
          const response = await res.json();
          setBvnnumber(response.data.bvn)
          setLoading(false)
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }
    useEffect(()=>{
        GetBVN()
    }, [])

    async function EditBVN() {
        Keyboard.dismiss()
        const userToken = await AsyncStorage.getItem('userToken');
        setLoading(true);
        fetch(`${BaseUrl}/user/bvn/edit`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            },
            body: JSON.stringify({
                bvn: bvnNumber
            })
        }).then(async (res) => {
            if (res.status === 204 || res.status === 200) {
                setLoading(false);
                const bvn_verified_status = res.status === 204 ? false : true;
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: `BVN updated ${bvn_verified_status ? "& verified " : ""}successfully!`
                })
                nav.goBack();
            } else {
                const error_res = await res.json();
                setLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.status !== 422 ? "Error occured while updating" : error_res.data[0].msg
                });
            }
        }).catch((err) => {
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    return (
        Platform.OS === "ios" ?
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.wrapper}>

                        {/*Top bar*/}
                        <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                            <View style={{ alignItems: "center" }}>
                                <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>BVN</Text>
                                <Text style={{ fontFamily: "lexendLight" }}>Insert your BVN</Text>
                            </View>
                            <View />
                        </View>

                        <View style={{ margin: 15 }}>
                            <Text style={{ fontFamily: 'lexendBold' }}>BVN</Text>
                            <TextInput
                                maxLength={11}
                                value={bvnNumber}
                                onChangeText={(txt) => setBvnnumber(txt)}
                                keyboardType='number-pad'
                                style={styles.textInput}
                                placeholder='Enter BVN'
                            />
                        </View>

                        <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
                            <TouchableOpacity disabled={bvnNumber.length == 11 ? false : true || loading} style={styles.btn} onPress={EditBVN}>
                                {loading ? (
                                    <ActivityIndicator color={'#fff'} size={'small'} />
                                ) : (
                                    <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Next</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView> :
            <View style={styles.wrapper}>

                {/*Top bar*/}
                <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                    <View style={{ alignItems: "center" }}>
                        <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>BVN</Text>
                        <Text style={{ fontFamily: "lexendLight" }}>Insert your BVN</Text>
                    </View>
                    <View />
                </View>

                <View style={{ margin: 15 }}>
                    <Text style={{ fontFamily: 'lexendBold' }}>BVN</Text>
                    <TextInput
                        maxLength={11}
                        value={bvnNumber}
                        onChangeText={(txt) => setBvnnumber(txt)}
                        keyboardType='number-pad'
                        style={styles.textInput}
                        placeholder='Enter BVN'
                    />
                </View>

                <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
                    <TouchableOpacity disabled={bvnNumber.length == 11 ? false : true || loading} style={styles.btn} onPress={EditBVN}>
                        {loading ? (
                            <ActivityIndicator color={'#fff'} size={'small'} />
                        ) : (
                            <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Next</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    textInput: {
        height: 50,
        backgroundColor: "#eee",
        borderRadius: 8,
        paddingLeft: 20, fontFamily: "lexendMedium",
        marginTop: 10
    },
    btn: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: 8,
        width: 300
    }
})