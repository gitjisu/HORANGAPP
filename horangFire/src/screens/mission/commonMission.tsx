import React, {useEffect, useState} from 'react';
import {color, font} from '../../styles/colorAndFontTheme';
import TitleText from '../../components/common/TitleText';
import {RNS3} from 'react-native-s3-upload';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Btn from '../../components/common/Btn_short';
import MissionTxt from '../../components/mission/MissionTxt';
import HelpTxt from '../../components/mission/HelpTxt';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase, RouteProp} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {selectCharacter, selectName} from '../../store/character';
import api from '../../api/api_controller';
import {reset, selectFile} from '../../store/mission';
import process from 'process';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: color.BACK_SUB,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cont1: {
    flex: 2,
  },
  cont2: {
    flex: 5,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 30,
  },
  btns: {
    flex: 1,
    flexDirection: 'row',
  },
  box: {
    position: 'absolute',
    width: 307,
    height: 430,
  },
  help: {
    fontFamily: font.beeBold,
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 50,
    paddingTop: 30,
  },
  helpBtn: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 100,
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: color.WHITE_OPAC,
  },
});

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'CommonMission'>;
  route: RouteProp<ParamListBase, 'CommonMission'>;
}

const CommonMission = ({navigation, route}: Props) => {
  const dispatch = useDispatch();
  const name = useSelector(selectName);
  const charInfo = useSelector(selectCharacter)?.userCharacter;
  // const imgUrl = useSelector(selectFile); // file img
  const [clickHelp, setClickHelp] = useState(false);
  const image = useSelector(selectFile); // ????????? ??????
  const [diary, setDiary] = useState('');
  const [point, setPoint] = useState(0); // ????????? ?????? ??????
  const [loca, setLoca] = useState('');

  const handleSubmit = () => {
    if (diary) {
      checkImage();
    } else {
      Alert.alert('???????????? ?????????', '?????? ??????????????????!', [{text: '??????'}]);
    }
  };
  // ?????? ??????
  const submit = async () => {
    try {
      await api.diary.submit({
        content: diary,
        imgUrl: loca,
        userId: charInfo?.user_id,
        userCharacterId: charInfo?.id,
        charactersId: charInfo?.character_id,
        characterMissionId: route.params?.id,
        addPoint: point,
        isMain: 0,
      });
      dispatch(reset());
      navigation.navigate('SubmitMission', {
        type: 'common',
        point: point,
      });
    } catch (err) {
      Alert.alert('?????? ????????????');
    }
  };

  const checkImage = () => {
    if (diary !== '' && image.file !== '') {
      // s3 ?????? ??????
      RNS3.put(
        {
          uri: image.file,
          name: image.name,
          type: image.type,
        },
        {
          bucket: process.env.BUCKET_NAME,
          region: 'ap-northeast-2',
          accessKey: process.env.ACCESS_KEY,
          secretKey: process.env.SECRET_KEY,
          successActionStatus: 201,
        },
      ).then((res: any) => {
        if (res.status === 201) {
          setLoca(res.body.postResponse.location);
        } else {
          Alert.alert('????????? ??????');
        }
      });
    } else {
      Alert.alert('???????????? ?????????', '?????? ?????? ?????? ??????????????????!', [
        {text: '??????'},
      ]);
    }
  };

  useEffect(() => {
    if (loca !== '' && diary) {
      submit();
    }
  }, [loca]);

  useEffect(() => {
    const random = Math.floor(Math.random() * 15) + 6;
    setPoint(random); // 1~10????????? ?????? ????????? ??????
  }, []);

  const goBack = () => {
    dispatch(reset());
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{backgroundColor: color.BACK_SUB}}>
      <View style={styles.container}>
        <View style={styles.cont1}>
          <TitleText title={name} subTitle="?????? ?????? ????????????" />
        </View>

        <View style={styles.cont2}>
          <Image
            style={styles.box}
            source={require('../../assets/image/box_large.png')}
          />
          <View style={styles.help}>
            <TouchableOpacity
              style={styles.helpBtn}
              onPress={() => setClickHelp(!clickHelp)}>
              <Text>{clickHelp ? 'X' : '?'}</Text>
            </TouchableOpacity>
          </View>
          {!clickHelp && (
            <MissionTxt
              mission={route.params.title}
              setDiary={setDiary}
              navigation={navigation}
            />
          )}
          {clickHelp && (
            <HelpTxt imgUrl={route.params.imgUrl} info={route.params.content} />
          )}
        </View>

        <View style={styles.btns}>
          <Btn txt="????????????" clickEvent={goBack} />
          <Btn txt="????????????" clickEvent={handleSubmit} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CommonMission;
