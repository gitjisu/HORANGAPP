package com.dool.characterservice.api.service;

import com.dool.characterservice.api.client.UserServiceClient;
import com.dool.characterservice.api.request.UserCharacterRequestDto;
import com.dool.characterservice.api.response.UserCharacterResponseDto;
import com.dool.characterservice.db.domain.CharacterLevel;
import com.dool.characterservice.db.domain.CharacterMission;
import com.dool.characterservice.db.domain.Characters;
import com.dool.characterservice.db.domain.UserCharacter;
import com.dool.characterservice.db.repository.CharactersRepository;
import com.dool.characterservice.db.repository.UserCharacterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserCharacterServiceImpl implements UserCharacterService{
    private final int exp = 1;
    private final UserCharacterRepository userCharacterRepository;
    private final CharactersRepository charactersRepository;
    private final UserServiceClient userServiceClient;

    // 유저 캐릭터 만들기
    @Override
    public UserCharacterResponseDto creatUserCharacter(UserCharacterRequestDto requestDto) {

        Characters characters = charactersRepository.findById(requestDto.getCharacter_id()).get();
        LocalDate date = LocalDate.now();

        UserCharacter userCharacter = userCharacterRepository.findByUserIdAndStatusFalse(requestDto.getUser_id()).orElseGet(() -> {
            UserCharacter character = UserCharacter.builder()
                    .userId(requestDto.getUser_id())
                    .characters(characters)
                    .nickname(requestDto.getNickname())
                    .level(CharacterLevel.LEVEL_1)
                    .createdDate(date)
                    .build();

            userCharacterRepository.save(character);

            return character;
        });

        userServiceClient.inputUserBackground(userCharacter.getUserId(), userCharacter.getCharacters().getBackgroundId());

        return UserCharacterResponseDto.builder()
                .id(userCharacter.getId())
                .character_id(userCharacter.getCharacters().getId())
                .user_id(userCharacter.getUserId())
                .characterLevel(userCharacter.getLevel())
                .nickname(userCharacter.getNickname())
                .created_date(userCharacter.getCreatedDate())
                .build();
    }

    // 유저 캐릭터 아이디로 유저 캐릭터 찾아오기
    @Override
    public UserCharacterResponseDto getUserCharacter(Long id) {
        Optional<UserCharacter> object = userCharacterRepository.findById(id);
        UserCharacter userCharacter = object.get();

        return UserCharacterResponseDto.builder()
                .id(userCharacter.getId())
                .character_id(userCharacter.getCharacters().getId())
                .user_id(userCharacter.getUserId())
                .created_date(userCharacter.getCreatedDate())
                .nickname(userCharacter.getNickname())
                .characterLevel(userCharacter.getLevel())
                .status(userCharacter.isStatus())
                .build();
    }

    // 유저 아이디로 유저 캐릭터 찾아오기
    @Override
    public UserCharacterResponseDto getUserCharacterByUserId(String user_id) {
        Optional<UserCharacter> find = userCharacterRepository.findByUserIdAndStatusFalse(user_id);

        UserCharacter userCharacter = find.orElseGet(() -> null);

        if(userCharacter == null){
            return null;
        }

        return UserCharacterResponseDto.builder()
                .id(userCharacter.getId())
                .character_id(userCharacter.getCharacters().getId())
                .user_id(userCharacter.getUserId())
                .created_date(userCharacter.getCreatedDate())
                .nickname(userCharacter.getNickname())
                .characterLevel(userCharacter.getLevel())
                .status(userCharacter.isStatus())
                .build();
    }

    @Override
    public List<UserCharacterResponseDto> getGrownCharacterList(String user_id) {
        List<UserCharacter> list = userCharacterRepository.findAllByUserIdAndStatusTrue(user_id);
        List<UserCharacterResponseDto> result = new ArrayList<>();

        list.forEach(v -> {
            result.add(UserCharacterResponseDto.builder()
                            .id(v.getId())
                            .user_id(v.getUserId())
                            .character_id(v.getCharacters().getId())
                            .characterLevel(v.getLevel())
                            .nickname(v.getNickname())
                            .created_date(v.getCreatedDate())
                            .completed_date(v.getCompleted_date())
                            .status(v.isStatus())
                    .build());
        });

        return result;
    }

    @Override
    public void del(Long UCId) {
        userCharacterRepository.delete(userCharacterRepository.findById(UCId).orElseThrow());

        return;
    }

    @Override
    public boolean checkGrown(Long UCId) {
        UserCharacter userCharacter = userCharacterRepository.findById(UCId).orElseThrow();

        if(userCharacter.getLevel() == CharacterLevel.LEVEL_MAX){
            return true;
        }
        return false;
    }

    @Override
    public boolean levelUp(Long UCId, Long cnt) {
        UserCharacter userCharacter = userCharacterRepository.findById(UCId).orElseThrow();
        CharacterLevel characterLevel = CharacterLevel.LEVEL_1;

        int level = (cnt == 0) ? 0 : (int) (cnt / exp);

        switch (level){
            case 0 : characterLevel = CharacterLevel.LEVEL_1;
                break;
            case 1 : characterLevel = CharacterLevel.LEVEL_2;
                break;
            case 2 : characterLevel = CharacterLevel.LEVEL_3;
                break;
            case 3 : characterLevel = CharacterLevel.LEVEL_MAX;
                break;
        }

        userCharacter.setLevel(characterLevel);

        if(userCharacter.getLevel() == CharacterLevel.LEVEL_MAX){
            userCharacter.setStatus(true);
            userCharacter.setCompleted_date(LocalDate.now());
            return true;
        }

        return false;
    }
}
