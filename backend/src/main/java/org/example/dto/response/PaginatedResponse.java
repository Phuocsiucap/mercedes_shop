package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginatedResponse<T> {

    private boolean success;

    private String message;

    private List<T> content;

    private int totalElements;

    private int totalPages;

    private int currentPage;

    private int size;

    private boolean first;

    private boolean last;

    private LocalDateTime timestamp;

    public static <T> PaginatedResponse<T> success(List<T> content, int totalElements, 
                                                   int totalPages, int currentPage, int size) {
        return PaginatedResponse.<T>builder()
                .success(true)
                .message("Success")
                .content(content)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .currentPage(currentPage)
                .size(size)
                .first(currentPage == 0)
                .last(currentPage == totalPages - 1)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> PaginatedResponse<T> success(String message, List<T> content, 
                                                   int totalElements, int totalPages, 
                                                   int currentPage, int size) {
        return PaginatedResponse.<T>builder()
                .success(true)
                .message(message)
                .content(content)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .currentPage(currentPage)
                .size(size)
                .first(currentPage == 0)
                .last(currentPage == totalPages - 1)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> PaginatedResponse<T> error(String message) {
        return PaginatedResponse.<T>builder()
                .success(false)
                .message(message)
                .content(null)
                .totalElements(0)
                .totalPages(0)
                .currentPage(0)
                .size(0)
                .first(true)
                .last(true)
                .timestamp(LocalDateTime.now())
                .build();
    }
}