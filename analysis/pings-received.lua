-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.

--[[
# JS Error Shield Study: Received Pings
[CEP][] plugin that estimates the number of pings received over the past two
days. This is mostly used as a sanity check that data is being sent
successfully.

[CEP]: https://docs.telemetry.mozilla.org/concepts/data_pipeline.html#hindsight

## Sample Configuration
```lua
filename = 'shield-study-js-errors-pings-received.lua'
message_matcher = 'Type=="telemetry" && Fields[docType]=="shield-study-addon" && Fields[submission]=~"\\"study_name\\":\\"shield%-study%-js%-errors\\""'
preserve_data = true
ticker_interval = 60
```
--]]
require "circular_buffer"

cb = circular_buffer.new(3600, 1, 60)
cb:set_header(1, "success")

function process_message()
  cb:add(read_message("Timestamp"), 1, 1)
  return 0
end

function timer_event()
  inject_payload("cbuf", "JS error study pings per minute", cb)
end
