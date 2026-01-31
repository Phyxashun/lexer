# ~/.config/fish/functions/update_count.fish

function update_count
    begin; checkupdates; paru -Qua; end | wc -l
end
