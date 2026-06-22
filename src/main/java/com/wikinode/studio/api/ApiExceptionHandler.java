package com.wikinode.studio.api;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException error) {
    return ResponseEntity
      .status(error.getStatusCode())
      .body(Map.of(
        "status", error.getStatusCode().value(),
        "error", error.getStatusCode().toString(),
        "message", error.getReason() == null ? "Request failed" : error.getReason()
      ));
  }
}
