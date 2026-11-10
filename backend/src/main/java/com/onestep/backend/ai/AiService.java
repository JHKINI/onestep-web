
package com.onestep.backend.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final Client client;

    public AiService() {
        this.client = new Client();
    }

    // ① 프로젝트 → 목표 후보
    public String generateProblems(
            String concern,
            String priority
    ) {

        String priorityText =
                "IMPORTANT".equals(priority)
                        ? "가장 중요한 부분부터"
                        : "가장 급한 부분부터";

        String prompt = """
                너는 '한 걸음' 서비스의 AI 도우미다.

                사용자가 진행해야 하는 프로젝트를 보고,
                프로젝트 안에서 먼저 다뤄볼 목표 후보 3개를 만들어라.

                우선순위 기준:
                %s

                사용자가 입력한 프로젝트:
                %s

                목표는 프로젝트를 진행하면서
                사용자가 먼저 이루고 싶은 구체적인 결과나 방향이다.

                중요한 원칙:
                - 프로젝트와 직접 관련된 목표만 제시한다.
                - 사용자의 프로젝트를 대신 해결하지 않는다.
                - 너무 거창한 장기 목표는 피한다.
                - 서로 다른 방향의 목표 3개를 제시한다.
                - 사용자가 이해하기 쉬운 표현을 사용한다.
                - 사용자가 최종적으로 하나를 선택한다.
                - title과 description 안에 Markdown 문법, 별표, 하이픈, 불릿 기호를 사용하지 않는다.

                반드시 아래 JSON 형식으로만 응답한다.
                JSON 앞뒤에 다른 설명이나 코드 블록 표시를 붙이지 않는다.

                {
                  "goals": [
                    {
                      "title": "목표 제목",
                      "description": "목표에 대한 짧은 설명"
                    },
                    {
                      "title": "목표 제목",
                      "description": "목표에 대한 짧은 설명"
                    },
                    {
                      "title": "목표 제목",
                      "description": "목표에 대한 짧은 설명"
                    }
                  ]
                }
                """.formatted(
                priorityText,
                concern
        );

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.6-flash",
                        prompt,
                        null
                );

        return response.text();
    }


    // ② 목표 → 작은 과제 후보
    public String generateActions(
            String concern,
            String goal
    ) {

        String prompt = """
                너는 '한 걸음' 서비스의 AI 도우미다.

                사용자가 진행 중인 프로젝트와
                선택한 목표를 보고,
                먼저 해볼 수 있는 작은 과제 3개를 제안한다.

                프로젝트:
                %s

                사용자가 선택한 목표:
                %s

                작은 과제는 해당 목표를 진행하기 위한
                하나의 중간 작업이어야 한다.

                중요한 원칙:
                - 프로젝트와 선택한 목표에 직접 연결되어야 한다.
                - 단순한 한 줄짜리 행동보다는 하나의 과제로 느껴져야 한다.
                - 너무 거창하거나 장기적인 계획은 피한다.
                - 서로 다른 방법이나 방향의 과제 3개를 제시한다.
                - 사용자가 최종적으로 하나를 선택한다.
                - 과제 문장 안에 Markdown 문법, 별표, 하이픈, 불릿 기호를 사용하지 않는다.

                반드시 아래 JSON 형식으로만 응답한다.
                JSON 앞뒤에 다른 설명이나 코드 블록 표시를 붙이지 않는다.

                {
                  "tasks": [
                    "작은 과제 1",
                    "작은 과제 2",
                    "작은 과제 3"
                  ]
                }
                """.formatted(
                concern,
                goal
        );

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.6-flash",
                        prompt,
                        null
                );

        return response.text();
    }


    // ③ 작은 과제 → 오늘 할 행동 후보
    public String generateTodayActions(
            String concern,
            String goal,
            String task
    ) {

        String prompt = """
                너는 '한 걸음' 서비스의 AI 도우미다.

                사용자가 선택한 프로젝트의 작은 과제를
                오늘 바로 시작할 수 있는 구체적인 행동으로 바꿔라.

                프로젝트:
                %s

                선택한 목표:
                %s

                선택한 작은 과제:
                %s

                중요한 원칙:
                - 오늘 바로 시작할 수 있어야 한다.
                - 실제 행동을 표현해야 한다.
                - 가능하면 5~20분 안에 시작할 수 있는 수준으로 만든다.
                - 너무 추상적인 표현은 피한다.
                - 프로젝트의 현재 단계와 선택한 과제를 고려한다.
                - 서로 다른 행동 3개를 제시한다.
                - 사용자가 최종적으로 하나를 선택한다.
                - 행동 문장 안에 Markdown 문법, 별표, 하이픈, 불릿 기호를 사용하지 않는다.

                반드시 아래 JSON 형식으로만 응답한다.
                JSON 앞뒤에 다른 설명이나 코드 블록 표시를 붙이지 않는다.

                {
                  "todayActions": [
                    "오늘 할 행동 1",
                    "오늘 할 행동 2",
                    "오늘 할 행동 3"
                  ]
                }
                """.formatted(
                concern,
                goal,
                task
        );

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.6-flash",
                        prompt,
                        null
                );

        return response.text();
    }


    // ④ 부담스러운 오늘의 행동 → 한 번만 더 작게
    public String generateShrinkActions(
            String concern,
            String goal,
            String task,
            String action
    ) {

        String prompt = """
                너는 '한 걸음' 서비스의 AI 도우미다.

                사용자가 선택한 오늘의 행동이 부담스럽다고 느끼고 있다.
                이 행동을 사용자가 지금 바로 시작할 수 있도록
                한 번만 더 작은 행동 3개로 줄여라.

                전체 프로젝트:
                %s

                선택한 목표:
                %s

                선택한 작은 과제:
                %s

                사용자가 선택한 오늘의 행동:
                %s

                중요한 원칙:
                - 원래 행동의 목적은 유지한다.
                - 한 번에 너무 많은 일을 하도록 만들지 않는다.
                - 5~10분 정도 안에 시작할 수 있는 수준을 우선한다.
                - 조사하기, 계획하기처럼 추상적인 표현보다 실제 행동을 사용한다.
                - 서로 다른 방법의 작은 행동 3개를 제시한다.
                - 사용자가 최종적으로 하나를 직접 선택한다.
                - 사용자가 다시 부담을 느끼지 않도록 최대한 간단하게 만든다.

                반드시 아래 JSON 형식으로만 응답한다.
                JSON 앞뒤에 다른 설명이나 코드 블록 표시를 붙이지 않는다.

                {
                  "actions": [
                    "작게 줄인 행동 1",
                    "작게 줄인 행동 2",
                    "작게 줄인 행동 3"
                  ]
                }
                """.formatted(
                concern,
                goal,
                task,
                action
        );

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.6-flash",
                        prompt,
                        null
                );

        return response.text();
    }
}