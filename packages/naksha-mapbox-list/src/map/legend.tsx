import { Box, Divider, Stack } from "@chakra-ui/react";
import { useT } from "@ibp/naksha-commons";
import React from "react";

import { useLayers } from "../hooks/use-layers";
import { IconCircle } from "./icons";

export default function Legend() {
  const {
    legend: { visible, stops, squareSize },
  } = useLayers();
  const { t } = useT();

  if (!visible) return null;

  return (
    <Box
      m={4}
      mb={8}
      p={2}
      position="absolute"
      right={0}
      bottom={0}
      bg="white"
      borderRadius="md"
      fontSize="xs"
    >
      {stops.map(([stop, color], index, stopsArr) => {
        const prevStop = (stopsArr[index - 1] || [0])[0];
        return (
          <Stack
            isInline={true}
            hidden={prevStop === stop}
            key={index}
            alignItems="center"
          >
            <IconCircle color={color} />
            <span>
              {prevStop} - {stop}
            </span>
          </Stack>
        );
      })}
      <Divider my={1} />
      <div>
        1 {t("square")} = {squareSize} x {squareSize} km
      </div>
    </Box>
  );
}
