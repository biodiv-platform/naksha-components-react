import {
  Box,
  Button,
  Flex,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
} from "@chakra-ui/react";
import { LICENSES, useT } from "@ibp/naksha-commons";
import React from "react";

import { useLayers } from "../../../hooks/use-layers";
import { overflowStyle1 } from "../../../static/constants";
import {
  IconCredit,
  IconDownload,
  IconExternalLink,
  IconInfo,
  IconLicense,
  IconTag,
} from "../../icons";
import ManagePublishing from "./manage-publishing";

interface ListItemProps {
  icon;
  children;
  title?;
}

const ListItem = ({ icon: Icon, children, title }: ListItemProps) => (
  <Box style={overflowStyle1} fontSize="sm" title={title}>
    <Icon ml={1} mr={3} />
    {children}
  </Box>
);

interface ItemInfoProps {
  layer;
  onDownload;
  mb?;
}

export default function ItemInfo({ layer, onDownload, mb }: ItemInfoProps) {
  const { managePublishing } = useLayers();
  const { t } = useT();

  return (
    <Box color="gray.600" mb={mb}>
      <ListItem icon={IconCredit} title={layer.attribution}>
        {layer.attribution}
      </ListItem>
      <ListItem icon={IconTag}>{layer?.tags?.join(", ")}</ListItem>
      <ListItem icon={IconLicense}>
        {layer.license ? (
          <Link
            target="_blank"
            color="blue.500"
            fontWeight="bold"
            rel="noopener"
            href={LICENSES[layer.license]}
          >
            {layer.license} <IconExternalLink />
          </Link>
        ) : (
          "NA"
        )}
      </ListItem>
      {layer.source.type !== "grid" && (
        <Flex justifyContent="space-between" mt={2}>
          {managePublishing && (
            <ManagePublishing
              layerStatus={layer.layerStatus}
              layerId={layer.id}
            />
          )}
          <Button
            variant="outline"
            colorScheme="blue"
            size="sm"
            leftIcon={<IconDownload />}
            disabled={!layer.isDownloadable}
            onClick={onDownload}
          >
            {t("download")}
          </Button>
          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                colorScheme="teal"
                size="sm"
                leftIcon={<IconInfo />}
              >
                {t("more_info")}
              </Button>
            </PopoverTrigger>
            <Portal>
              <PopoverContent>
                <PopoverArrow />
                <PopoverBody fontSize="sm">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <b>{t("created_by")}</b>
                        </td>
                        <td>{layer.createdBy}</td>
                      </tr>
                      <tr>
                        <td>
                          <b>{t("uploaded")}</b>
                        </td>
                        <td>{layer.author.name}</td>
                      </tr>
                      <tr>
                        <td>
                          <b>{t("url")}</b>
                        </td>
                        <td>{layer.url}</td>
                      </tr>
                      <tr>
                        <td>
                          <b>{t("created_on")}</b>
                        </td>
                        <td>{new Date(layer.createdDate).toDateString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        </Flex>
      )}
    </Box>
  );
}
