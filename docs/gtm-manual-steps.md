# GTM + GA4 manual steps — airimation.in

Generated 2026-11-27 from `analytics-plan.json`. Nothing here publishes on its own.

## A. Import (preferred)

1. GTM → Admin → **Import Container** → choose `gtm-container.json`.
2. Workspace: **New** ("Analytics import").
3. **Merge** → **Rename conflicting tags, triggers, and variables**. If the preview shows anything *deleted*, cancel: Overwrite was chosen.
4. **Preview** → walk through the actions in `docs/analytics-setup.md` → each `GA4 - <event>` tag fires once with its params.
5. **Submit** only when the site owner says so.

## B. Manual fallback (if import is refused)

Variables → New:
- Constant `CONST - GA4 Measurement ID` = `G-E6GF8L77GF`
- Data Layer Variable `DLV - page_type` → name `page_type`, version 2
- Data Layer Variable `DLV - lead_type` → name `lead_type`, version 2
- Data Layer Variable `DLV - lead_time` → name `lead_time`, version 2
- Data Layer Variable `DLV - source_formation` → name `source_formation`, version 2
- Data Layer Variable `DLV - form_id` → name `form_id`, version 2
- Data Layer Variable `DLV - error_type` → name `error_type`, version 2
- Data Layer Variable `DLV - error_field` → name `error_field`, version 2
- Data Layer Variable `DLV - cta_name` → name `cta_name`, version 2
- Data Layer Variable `DLV - placement` → name `placement`, version 2
- Data Layer Variable `DLV - link_url` → name `link_url`, version 2
- Data Layer Variable `DLV - method` → name `method`, version 2
- Data Layer Variable `DLV - formation_id` → name `formation_id`, version 2
- Data Layer Variable `DLV - formation_theme` → name `formation_theme`, version 2
- Data Layer Variable `DLV - fleet_size` → name `fleet_size`, version 2
- Data Layer Variable `DLV - led_theme` → name `led_theme`, version 2
- Data Layer Variable `DLV - pick_method` → name `pick_method`, version 2
- Data Layer Variable `DLV - control` → name `control`, version 2
- Data Layer Variable `DLV - option` → name `option`, version 2
- Data Layer Variable `DLV - scene` → name `scene`, version 2
- Data Layer Variable `DLV - result` → name `result`, version 2
- Data Layer Variable `DLV - quality_tier` → name `quality_tier`, version 2
- Data Layer Variable `DLV - action` → name `action`, version 2
- Data Layer Variable `DLV - beat` → name `beat`, version 2
- Data Layer Variable `DLV - content_type` → name `content_type`, version 2
- Data Layer Variable `DLV - item_id` → name `item_id`, version 2
- Data Layer Variable `DLV - description` → name `description`, version 2
- Data Layer Variable `DLV - fatal` → name `fatal`, version 2
- Data Layer Variable `DLV - metric_name` → name `metric_name`, version 2
- Data Layer Variable `DLV - metric_rating` → name `metric_rating`, version 2
- Data Layer Variable `DLV - metric_value` → name `metric_value`, version 2
- 1st-Party Cookie `COOKIE - traffic_type` → cookie `traffic_type`
- Google tag: Event Settings `GES - Global Event Params` → rows: `page_type`, `traffic_type`

Tags → New:
- **Google tag** `Google Tag - airimation.in - Web`: Tag ID `{{CONST - GA4 Measurement ID}}`, Shared event settings `{{GES - Global Event Params}}`, trigger **Initialization - All Pages**.
- Trigger `CE - generate_lead` (Custom Event, event name `generate_lead`) → Tag `GA4 - generate_lead` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `generate_lead`, event settings variable `{{GES - Global Event Params}}`, params `lead_type`=`{{DLV - lead_type}}`, `lead_time`=`{{DLV - lead_time}}`, `source_formation`=`{{DLV - source_formation}}`).
- Trigger `CE - form_start` (Custom Event, event name `form_start`) → Tag `GA4 - form_start` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `form_start`, event settings variable `{{GES - Global Event Params}}`, params `form_id`=`{{DLV - form_id}}`).
- Trigger `CE - form_submit_error` (Custom Event, event name `form_submit_error`) → Tag `GA4 - form_submit_error` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `form_submit_error`, event settings variable `{{GES - Global Event Params}}`, params `form_id`=`{{DLV - form_id}}`, `error_type`=`{{DLV - error_type}}`, `error_field`=`{{DLV - error_field}}`).
- Trigger `CE - cta_click` (Custom Event, event name `cta_click`) → Tag `GA4 - cta_click` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `cta_click`, event settings variable `{{GES - Global Event Params}}`, params `cta_name`=`{{DLV - cta_name}}`, `placement`=`{{DLV - placement}}`, `link_url`=`{{DLV - link_url}}`).
- Trigger `CE - contact_click` (Custom Event, event name `contact_click`) → Tag `GA4 - contact_click` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `contact_click`, event settings variable `{{GES - Global Event Params}}`, params `method`=`{{DLV - method}}`, `placement`=`{{DLV - placement}}`).
- Trigger `CE - formation_view` (Custom Event, event name `formation_view`) → Tag `GA4 - formation_view` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `formation_view`, event settings variable `{{GES - Global Event Params}}`, params `formation_id`=`{{DLV - formation_id}}`, `formation_theme`=`{{DLV - formation_theme}}`, `fleet_size`=`{{DLV - fleet_size}}`, `led_theme`=`{{DLV - led_theme}}`, `pick_method`=`{{DLV - pick_method}}`).
- Trigger `CE - show_customise` (Custom Event, event name `show_customise`) → Tag `GA4 - show_customise` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `show_customise`, event settings variable `{{GES - Global Event Params}}`, params `control`=`{{DLV - control}}`, `option`=`{{DLV - option}}`, `formation_id`=`{{DLV - formation_id}}`).
- Trigger `CE - scene_3d` (Custom Event, event name `scene_3d`) → Tag `GA4 - scene_3d` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `scene_3d`, event settings variable `{{GES - Global Event Params}}`, params `scene`=`{{DLV - scene}}`, `result`=`{{DLV - result}}`, `quality_tier`=`{{DLV - quality_tier}}`, `action`=`{{DLV - action}}`).
- Trigger `CE - home_story_progress` (Custom Event, event name `home_story_progress`) → Tag `GA4 - home_story_progress` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `home_story_progress`, event settings variable `{{GES - Global Event Params}}`, params `beat`=`{{DLV - beat}}`).
- Trigger `CE - select_content` (Custom Event, event name `select_content`) → Tag `GA4 - select_content` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `select_content`, event settings variable `{{GES - Global Event Params}}`, params `content_type`=`{{DLV - content_type}}`, `item_id`=`{{DLV - item_id}}`).
- Trigger `CE - share` (Custom Event, event name `share`) → Tag `GA4 - share` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `share`, event settings variable `{{GES - Global Event Params}}`, params `method`=`{{DLV - method}}`, `content_type`=`{{DLV - content_type}}`, `item_id`=`{{DLV - item_id}}`).
- Trigger `CE - clip_record` (Custom Event, event name `clip_record`) → Tag `GA4 - clip_record` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `clip_record`, event settings variable `{{GES - Global Event Params}}`, params `action`=`{{DLV - action}}`, `formation_id`=`{{DLV - formation_id}}`, `fleet_size`=`{{DLV - fleet_size}}`).
- Trigger `CE - page_not_found` (Custom Event, event name `page_not_found`) → Tag `GA4 - page_not_found` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `page_not_found`, event settings variable `{{GES - Global Event Params}}`).
- Trigger `CE - exception` (Custom Event, event name `exception`) → Tag `GA4 - exception` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `exception`, event settings variable `{{GES - Global Event Params}}`, params `description`=`{{DLV - description}}`, `fatal`=`{{DLV - fatal}}`).
- Trigger `CE - web_vitals` (Custom Event, event name `web_vitals`) → Tag `GA4 - web_vitals` (Google Analytics: GA4 Event, Measurement ID `{{CONST - GA4 Measurement ID}}`, event name `web_vitals`, event settings variable `{{GES - Global Event Params}}`, params `metric_name`=`{{DLV - metric_name}}`, `metric_rating`=`{{DLV - metric_rating}}`, `metric_value`=`{{DLV - metric_value}}`).

## C. GA4 custom definitions (Admin → Data display → Custom definitions)

| Display name | Parameter | Scope | Kind |
|---|---|---|---|
| Page type | page_type | Event | Dimension |
| Lead type | lead_type | Event | Dimension |
| Lead time | lead_time | Event | Dimension |
| Source formation | source_formation | Event | Dimension |
| Form id | form_id | Event | Dimension |
| Error type | error_type | Event | Dimension |
| Error field | error_field | Event | Dimension |
| Cta name | cta_name | Event | Dimension |
| Placement | placement | Event | Dimension |
| Formation id | formation_id | Event | Dimension |
| Formation theme | formation_theme | Event | Dimension |
| Fleet size | fleet_size | Event | Dimension |
| Led theme | led_theme | Event | Dimension |
| Pick method | pick_method | Event | Dimension |
| Control | control | Event | Dimension |
| Option | option | Event | Dimension |
| Scene | scene | Event | Dimension |
| Result | result | Event | Dimension |
| Quality tier | quality_tier | Event | Dimension |
| Action | action | Event | Dimension |
| Beat | beat | Event | Dimension |
| Description | description | Event | Dimension |
| Fatal | fatal | Event | Dimension |
| Metric name | metric_name | Event | Dimension |
| Metric rating | metric_rating | Event | Dimension |
| Metric value | metric_value | Event | Metric (Standard) |
| (none: traffic_type is read by the internal-traffic data filter) | traffic_type | — | — |

Ecommerce params (`items`, `value`, `transaction_id`…) are built in; don't register them.

## D. Key events (Admin → Data display → Key events → New key event)

- `generate_lead`

Then work through the rest of the GA4 admin checklist (retention 14 months, unwanted referrals, internal traffic filter, links).
