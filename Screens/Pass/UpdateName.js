import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { return_trimmed_data } from '../../utils/Validations';

export default function UpdateName({ route }) {
    const { user } = route.params

    //nav props
    const nav = useNavigation();

    //some state
    const [firstName, setFirstName] = useState(user?.firstname);
    const [middleName, setMiddleName] = useState(user?.middlename || '');
    const [lastName, setLastName] = useState(user?.lastname);

    //loading state
    const [loading, setLoading] = useState(false)

    async function UpdateUserName() {
        setLoading(true);
        Keyboard.dismiss();
        const userToken = await AsyncStorage.getItem('userToken');

        fetch(`${BaseUrl}/user/profile/name`, {
            method: "PUT",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            },
            body: JSON.stringify({
                firstname: return_trimmed_data(firstName) || return_trimmed_data(user?.firstname),
                middlename: return_trimmed_data(middleName) || return_trimmed_data(user?.middlename),
                lastname: return_trimmed_data(lastName) || return_trimmed_data(user?.lastname),
            })
        }).then(async (res) => {
            setLoading(false);
            const response = await res.json();
            if (response.success) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Updated successfully!"
                })
                nav.goBack();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.status !== 422 ? response.message : response.data[0].msg
                })
            }
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }


    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
                <Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
                <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: 20, marginLeft: 10 }}>Update Name</Text>
            </View>

            <View style={{ margin: 15, marginTop: 20 }}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.topInfo}>First Name</Text>
                    <TextInput
                        value={firstName}
                        onChangeText={(txt) => setFirstName(txt)}
                        style={styles.inputStyle}
                        placeholder={user?.firstname}
                    />
                </View>
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.topInfo}>Middle Name</Text>
                    <TextInput
                        value={middleName}
                        onChangeText={(txt) => setMiddleName(txt)}
                        style={styles.inputStyle}
                        placeholder={user?.middlename}
                    />
                </View>
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.topInfo}>Last Name</Text>
                    <TextInput
                        value={lastName}
                        onChangeText={(txt) => setLastName(txt)}
                        style={styles.inputStyle}
                        placeholder={user?.lastname}
                    />
                </View>
            </View>

            <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
                <TouchableOpacity disabled={loading} style={styles.btnStyle} onPress={UpdateUserName}>
                    {loading ? (
                        <ActivityIndicator color="#fff" size={'small'} />
                    ) : (
                        <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Update</Text>
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
    topInfo: {
        fontFamily: "lexendBold",
        fontSize: 15,
        marginBottom: 15
    },
    inputStyle: {
        height: 50,
        borderRadius: 8,
        backgroundColor: "#eee",
        paddingLeft: 20,
        fontFamily: "lexendMedium",
        fontSize: 15
    },
    btnStyle: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        width: 300,
        borderRadius: 8
    }
})