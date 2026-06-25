package com.wikinode.studio.model;

import java.util.List;

public record ParserProfile(
  String parserProfile,
  String displayName,
  List<String> supportedRawMaterialTypes,
  List<String> supportedSourceTypes,
  String contentFormat,
  boolean enabled,
  String version
) {
}
