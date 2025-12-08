package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private String id;

    private String userId;

    private String userName;

    private String carId;

    private String carName;

    private String content;

    private Integer rating;

    private LocalDateTime createdAt;
}
