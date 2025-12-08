package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteResponse {

    private String id;

    private String userId;

    private String carId;

    private String carName;

    private BigDecimal carPrice;

    private String carImage;

    private String carColor;

    private Integer carSeats;

    private LocalDateTime addedAt;
}
